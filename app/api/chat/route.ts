export const maxDuration = 30;

import { createAgentUIStreamResponse, type UIMessage } from 'ai';
import { githubAgent } from '@/lib/ai/agent';
import { createClient } from '@/lib/supabase/server';
import * as messagesService from '@/lib/services/messages';
import { searchSimilarDocuments } from '@/lib/rag/search';

function textFromAssistantMessage(message: UIMessage): string {
  if (!message.parts?.length) return '';
  let out = '';
  for (const p of message.parts) {
    if (p.type === 'text' && 'text' in p && typeof p.text === 'string') {
      out += p.text;
    }
  }
  return out;
}

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && process.env.NODE_ENV !== 'development') {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!session?.provider_token) {
    return new Response('GitHub token missing — please sign out and back in.', { status: 401 });
  }

  if (chatId) {
    const { data: chat, error } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chatId)
      .single();

    if (error || !chat || chat.user_id !== session?.user?.id) {
      return new Response('Forbidden: You do not have access to this chat', { status: 403 });
    }
  }

  const ragUserId = session.user?.id;

  const safetyPromise = (async () => {
    const { validateMessageSafety } = await import('@/lib/safety');
    return validateMessageSafety(messages);
  })();

  const userMessageSavePromise = (async () => {
    if (chatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const content =
          typeof lastMessage.content === 'string'
            ? lastMessage.content
            : lastMessage.parts?.find((p: { type: string }) => p.type === 'text')?.text || '';

        await messagesService.createMessage(chatId, 'user', content, supabase);
      }
    }
  })();

  const ragPromise = (async () => {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role !== 'user' || !ragUserId) {
      return '';
    }

    const userQuery =
      typeof lastUserMessage.content === 'string'
        ? lastUserMessage.content
        : lastUserMessage.parts?.find((p: { type: string }) => p.type === 'text')?.text || '';

    try {
      const relevantDocs = await searchSimilarDocuments(userQuery, {
        userId: ragUserId,
        limit: 5,
        threshold: 0.7,
      });

      if (relevantDocs.length > 0) {
        console.log(`📚 Found ${relevantDocs.length} relevant code snippets for RAG context`);

        let context = '\n\n## 📚 Relevant Code Context\n\n';
        context += 'Here are some relevant code snippets from indexed repositories:\n\n';

        relevantDocs.forEach((doc, index) => {
          const { repo_name, file_path, chunk_index, total_chunks } = doc.metadata;
          context += `### ${index + 1}. ${repo_name} - ${file_path}\n`;
          if (total_chunks && total_chunks > 1) {
            context += `(Chunk ${(chunk_index || 0) + 1}/${total_chunks})\n`;
          }
          context += `Similarity: ${(doc.similarity * 100).toFixed(1)}%\n\n`;
          context += '```\n' + doc.content + '\n```\n\n';
        });

        context += '---\n\n';
        context +=
          'Use the above context to provide accurate, code-aware responses. ';
        context += 'Reference specific files and code when applicable.\n';
        return context;
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ RAG context retrieval failed:', msg);
    }
    return '';
  })();

  const safetyResponse = await safetyPromise;
  if (safetyResponse) return safetyResponse;

  const [ragContext] = await Promise.all([ragPromise, userMessageSavePromise]);

  const transformedMessages = messages.map((msg: Record<string, unknown>) => {
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg;
    }
    return {
      ...msg,
      parts:
        typeof msg.content === 'string'
          ? [{ type: 'text' as const, text: msg.content }]
          : (msg.content as unknown[]) || [],
    };
  });

  const messagesWithRAG = ragContext
    ? [
        {
          role: 'system' as const,
          content: ragContext,
        },
        ...transformedMessages,
      ]
    : transformedMessages;

  try {
    return createAgentUIStreamResponse({
      agent: githubAgent,
      uiMessages: messagesWithRAG,

      onFinish: async ({ responseMessage, isAborted }) => {
        if (!chatId || isAborted) return;
        const text = textFromAssistantMessage(responseMessage);
        if (!text.trim()) return;
        try {
          await messagesService.createMessage(chatId, 'assistant', text, supabase);
        } catch (err) {
          console.error('[chat] Failed to save assistant message:', err);
        }
      },
    });
  } catch (err) {
    console.error('[chat] Agent stream error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}

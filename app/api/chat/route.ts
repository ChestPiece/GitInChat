export const maxDuration = 30;

import { createAgentUIStreamResponse } from 'ai';
import { githubAgent } from '@/lib/ai/agent';
import { createClient } from '@/lib/supabase/server';
import * as messagesService from '@/lib/services/messages';
import { searchSimilarDocuments } from '@/lib/rag/search';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && process.env.NODE_ENV !== 'development') {
    return new Response('Unauthorized', { status: 401 });
  }

  // 🛡️ Safety Guard (Fail-Open)
  const { validateMessageSafety } = await import('@/lib/safety');
  const safetyResponse = await validateMessageSafety(messages);
  if (safetyResponse) return safetyResponse;

  // Save the user's message
  if (chatId && messages.length > 0) {
    // Verify chat ownership if chatId is provided
    if (chatId) {
      const { data: chat, error } = await supabase
        .from('chats')
        .select('user_id')
        .eq('id', chatId)
        .single();
      
      const user = session?.user;
      if (error || !chat || !user || chat.user_id !== user.id) {
         return new Response('Forbidden: You do not have access to this chat', { status: 403 });
      }
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      const content = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : lastMessage.parts?.find((p: any) => p.type === 'text')?.text || '';

      // Redaction is handled internally by createMessage
      await messagesService.createMessage(chatId, 'user', content, supabase);
    }
  }

  // Transform messages to ensure they have the 'parts' array required by createAgentUIStreamResponse
  const transformedMessages = messages.map((msg: any) => {
    // If message already has parts, use it
    if (msg.parts && Array.isArray(msg.parts)) {
      return msg;
    }
    // Otherwise, convert content to parts format
    return {
      ...msg,
      parts: typeof msg.content === 'string' 
        ? [{ type: 'text', text: msg.content }] 
        : msg.content || [],
    };
  });

  // 🧠 RAG: Retrieve relevant code context from indexed repositories
  let ragContext = '';
  const lastUserMessage = messages[messages.length - 1];
  
  if (lastUserMessage?.role === 'user') {
    const userQuery = typeof lastUserMessage.content === 'string'
      ? lastUserMessage.content
      : lastUserMessage.parts?.find((p: any) => p.type === 'text')?.text || '';

    try {
      // Search for relevant code snippets
      const relevantDocs = await searchSimilarDocuments(userQuery, {
        limit: 5,
        threshold: 0.7,
      });

      if (relevantDocs.length > 0) {
        console.log(`📚 Found ${relevantDocs.length} relevant code snippets for RAG context`);
        
        ragContext = '\n\n## 📚 Relevant Code Context\n\n';
        ragContext += 'Here are some relevant code snippets from indexed repositories:\n\n';
        
        relevantDocs.forEach((doc, index) => {
          const { repo_name, file_path, chunk_index, total_chunks } = doc.metadata;
          ragContext += `### ${index + 1}. ${repo_name} - ${file_path}\n`;
          if (total_chunks && total_chunks > 1) {
            ragContext += `(Chunk ${(chunk_index || 0) + 1}/${total_chunks})\n`;
          }
          ragContext += `Similarity: ${(doc.similarity * 100).toFixed(1)}%\n\n`;
          ragContext += '```\n';
          ragContext += doc.content;
          ragContext += '\n```\n\n';
        });

        ragContext += '---\n\n';
        ragContext += 'Use the above context to provide accurate, code-aware responses. ';
        ragContext += 'Reference specific files and code when applicable.\n';
      }
    } catch (error: any) {
      console.warn('⚠️ RAG context retrieval failed:', error.message);
      // Continue without RAG context rather than failing the entire request
    }
  }

  // Inject RAG context into the first system message or prepend it
  const messagesWithRAG = ragContext 
    ? [
        {
          role: 'system' as const,
          parts: [{ type: 'text' as const, text: ragContext }],
        },
        ...transformedMessages,
      ]
    : transformedMessages;

  // Use createAgentUIStreamResponse for proper streaming with ToolLoopAgent
  return createAgentUIStreamResponse({
    agent: githubAgent,
    uiMessages: messagesWithRAG,
    onStepFinish: async ({ text }) => {
      // Save assistant responses as they complete each step
      if (chatId && text) {
        await messagesService.createMessage(chatId, 'assistant', text, supabase);
      }
    }
  });
}




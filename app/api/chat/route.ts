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

  // 1. Parallelize independent validation and storage operations
  const safetyPromise = (async () => {
    const { validateMessageSafety } = await import('@/lib/safety');
    return validateMessageSafety(messages);
  })();

  const ownershipPromise = (async () => {
    if (!chatId) return null;
    const { data: chat, error } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', chatId)
      .single();
    
    // Check if chat exists and belongs to user
    if (error || !chat || chat.user_id !== session?.user?.id) {
       return new Response('Forbidden: You do not have access to this chat', { status: 403 });
    }
    return null;
  })();

  const userMessageSavePromise = (async () => {
      if (chatId && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
          const content = typeof lastMessage.content === 'string' 
            ? lastMessage.content 
            : lastMessage.parts?.find((p: any) => p.type === 'text')?.text || '';
          
          await messagesService.createMessage(chatId, 'user', content, supabase);
        }
      }
  })();

  const ragPromise = (async () => {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === 'user') {
        const userQuery = typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : lastUserMessage.parts?.find((p: any) => p.type === 'text')?.text || '';

        try {
          const relevantDocs = await searchSimilarDocuments(userQuery, {
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
            context += 'Use the above context to provide accurate, code-aware responses. ';
            context += 'Reference specific files and code when applicable.\n';
            return context;
          }
        } catch (error: any) {
          console.warn('⚠️ RAG context retrieval failed:', error.message);
        }
      }
      return '';
  })();

  // 2. Await critical checks
  const [safetyResponse, ownershipResponse] = await Promise.all([safetyPromise, ownershipPromise]);

  if (safetyResponse) return safetyResponse;
  if (ownershipResponse) return ownershipResponse;

  // 3. Await pre-computations needed for response
  const [ragContext] = await Promise.all([ragPromise, userMessageSavePromise]);

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
    },
    
  });
}




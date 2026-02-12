export const maxDuration = 30;

import { createAgentUIStreamResponse } from 'ai';
import { githubAgent } from '@/lib/ai/agent';
import { createClient } from '@/lib/supabase/server';
import * as messagesService from '@/lib/services/messages';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && process.env.NODE_ENV !== 'development') {
    return new Response('Unauthorized', { status: 401 });
  }

  // 🛡️ Safety Guard (Fail-Open)
  // We check the LAST message for malicious intent.
  try {
    const lastMessage = messages[messages.length - 1];
    const content = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : lastMessage.parts?.find((p: any) => p.type === 'text')?.text || '';

    // Only scan if there is text content
    if (content) {
      const { safetyClient, GITHUB_AGENT_SAFETY_PROMPT } = await import('@/lib/ai/safety');
      
      // Race: Safety Check vs Timeout (800ms)
      // If check is slow, we proceed (fail open) to avoid lag.
      
      // Race: Safety Check vs Timeout (800ms)
      // If check is slow, we proceed (fail open) to avoid lag.
      const safetyCheckPromise = safetyClient.guard({ 
        input: content, 
        systemPrompt: GITHUB_AGENT_SAFETY_PROMPT 
      });

      const timeoutPromise = new Promise<{ timeout: true }>((resolve) => 
        setTimeout(() => resolve({ timeout: true }), 800)
      );

      const result = await Promise.race([safetyCheckPromise, timeoutPromise]);

      if ('classification' in result && result.classification === 'block') {
         console.warn("[Safety Guard] Blocked:", result.violation_types);
         return new Response(JSON.stringify({
           error: "Request blocked by safety policy.",
           code: "safety_violation",
           details: result.violation_types 
         }), { status: 400 });
      } else if ('timeout' in result) {
         console.warn("[Safety Guard] Timeout - Proceeding (Fail Open)");
      }
    }
  } catch (error) {
    // Fail Open: Log error but allow request to proceed
    console.error("[Safety Guard] Check Error (Proceeding):", error);
  }

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

  // Use createAgentUIStreamResponse for proper streaming with ToolLoopAgent
  return createAgentUIStreamResponse({
    agent: githubAgent,
    uiMessages: transformedMessages,
    onStepFinish: async ({ text }) => {
      // Save assistant responses as they complete each step
      if (chatId && text) {
        await messagesService.createMessage(chatId, 'assistant', text, supabase);
      }
    }
  });
}




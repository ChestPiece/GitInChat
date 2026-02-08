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

  // Save the user's message
  if (chatId && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      const content = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : lastMessage.parts?.find((p: any) => p.type === 'text')?.text || '';
      await messagesService.createMessage(chatId, 'user', content);
    }
  }

  // Use createAgentUIStreamResponse for proper streaming with ToolLoopAgent
  // Note: Message persistence happens via onStepFinish if needed
  return createAgentUIStreamResponse({
    agent: githubAgent,
    uiMessages: messages,
    onStepFinish: async ({ text }) => {
      // Save assistant responses as they complete each step
      if (chatId && text) {
        await messagesService.createMessage(chatId, 'assistant', text);
      }
    }
  });
}



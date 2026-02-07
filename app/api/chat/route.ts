export const maxDuration = 30;

import { streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { tools } from '@/lib/ai/tools';
import { createClient } from '@/lib/supabase/server';
import * as messagesService from '@/lib/services/messages';
import { GITHUB_AGENT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system: GITHUB_AGENT_SYSTEM_PROMPT,
    messages,
    tools,
    stopWhen: stepCountIs(10), // Enable multi-step reasoning
    onFinish: async ({ response }) => {
       // Save the assistant's response to the database
       // Note: We need to handle tool calls persistence strategy here.
       // For now, we will save the text content.
       // If there are tool calls, we might want to append a summary or just save the generated text.
       // Vercel AI SDK 'response' object has 'messages' which are the appended messages.
       
       if (chatId) {
          const content = response.messages.map(m => m.content).join('\n');
           // Simple text persistence for now
           if (content) {
             await messagesService.createMessage(chatId, 'assistant', content);
           }
       }
    }
  });

  return result.toTextStreamResponse();
}

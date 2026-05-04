import { ToolLoopAgent, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { tools } from '@/lib/ai/tools';
import { GITHUB_AGENT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

/**
 * GitHub Agent - A reusable agent for managing GitHub repositories.
 * 
 * Uses the ToolLoopAgent class for:
 * - Centralized configuration
 * - Automatic loop management
 * - Type-safe tool execution
 */
export const agentModel = openai('gpt-4o-mini');
export const agentTools = tools;
export const agentSystemPrompt = GITHUB_AGENT_SYSTEM_PROMPT;

/**
 * Used with `createAgentUIStreamResponse` from the AI SDK. Alternative: `streamText` + `toUIMessageStreamResponse` for custom control.
 */
export const githubAgent = new ToolLoopAgent({
  model: agentModel,
  
  // Explicit settings for predictable behavior
  temperature: 0,
  maxOutputTokens: 2000,
  maxRetries: 2,
  
  instructions: agentSystemPrompt,
  tools: agentTools,
  prepareStep: async ({ stepNumber, steps }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Agent] Step ${stepNumber}:`, steps.map(s => s.toolCalls?.[0]?.toolName).filter(Boolean));
    }
    return {};
  },
  onStepFinish: async ({ stepNumber, toolCalls, toolResults }) => {
    console.log(`[Agent] Step ${stepNumber} complete:`, {
      toolsCalled: toolCalls?.map(t => t.toolName),
      resultsCount: toolResults?.length
    });
  },
  stopWhen: stepCountIs(15),
});

export type { ToolLoopAgent };

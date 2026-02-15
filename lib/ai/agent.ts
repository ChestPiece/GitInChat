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
export const githubAgent = new ToolLoopAgent({
  model: openai('gpt-4o-mini'),
  
  // Explicit settings for predictable behavior
  temperature: 0,  // Deterministic tool calls for consistency
  maxOutputTokens: 2000,  // Prevent excessive generation
  maxRetries: 2,  // Retry failed requests twice
  
  instructions: GITHUB_AGENT_SYSTEM_PROMPT,
  tools,
  stopWhen: stepCountIs(5), 
});

/**
 * Type export for use in UI components with useChat
 */
export type { ToolLoopAgent };

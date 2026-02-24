import { z } from 'zod';
import { UIMessage } from 'ai';

/**
 * Message metadata schema for type-safe metadata handling
 */
export const messageMetadataSchema = z.object({
  // Timestamp when message was created
  createdAt: z.number().optional(),
  
  // AI model used for generation
  model: z.string().optional(),
  
  // Token usage information
  totalTokens: z.number().optional(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  
  // Performance metrics
  generationTime: z.number().optional(),  // milliseconds
  
  // Finish reason
  finishReason: z.enum(['stop', 'length', 'tool-calls', 'error', 'other', 'unknown']).optional(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

/**
 * Typed UIMessage with our metadata
 */
export type ChatUIMessage = UIMessage & {
  metadata?: MessageMetadata;
};

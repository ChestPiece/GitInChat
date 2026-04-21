import { tool as aiTool } from 'ai';
import { z } from 'zod';
import { createError } from './utils';

export function createTool<T extends z.ZodType<any, any>, R = any>(params: {
  description: string;
  inputSchema: T;
  execute: (args: z.infer<T>) => Promise<R>;
}) {
  return aiTool({
    description: params.description,
    inputSchema: params.inputSchema,
    execute: async (args: z.infer<T>) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Tool] ${params.description.split('\n')[0].trim().slice(0, 50)}... executing with args:`, JSON.stringify(args, null, 2));
      }
      
      try {
        const result = await params.execute(args);
        
        if (process.env.NODE_ENV === 'development') {
          const resultStr = JSON.stringify(result, null, 2);
          const truncatedResult = resultStr.length > 2000 ? resultStr.slice(0, 2000) + '... (truncated)' : resultStr;
          console.log(`[Tool] Success:`, truncatedResult);
        }
        
        return result;
      } catch (error: any) {
        console.error(`[Tool] Error executing ${params.description.split('\n')[0].trim()}:`, error);
        
        // Return a structured error that the AI can understand
        // If the error is already a ToolResult (from createError), return it directly
        if (error.success === false && error.error) {
            return error;
        }

        return createError(
          error.message || "Unknown error occurred during tool execution",
          {
            details: error.response?.data || error.stack || undefined
          }
        );
      }
    }
  });
}

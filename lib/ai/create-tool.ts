import { tool as aiTool, type ToolExecutionOptions } from "ai";
import { z } from "zod";
import { createError } from "./utils";
import { logger } from "@/lib/logger";

/**
 * Creates a typed tool for the AI agent.
 * 
 * @template T - Zod schema for input validation
 * @template R - Return type of the execute function
 */
export function createTool<T extends z.ZodType, R>(params: {
  description: string;
  inputSchema: T;
  execute: (args: z.infer<T>, options: ToolExecutionOptions) => Promise<R>;
}) {
  return aiTool({
    description: params.description,
    inputSchema: params.inputSchema,
    execute: async (args: z.infer<T>, options: ToolExecutionOptions) => {
      if (process.env.NODE_ENV === "development") {
        logger.debug({ tool: params.description.split("\n")[0].trim().slice(0, 50), args }, 'Tool executing');
      }

      try {
        const result = await params.execute(args, options);

        if (process.env.NODE_ENV === "development") {
          const resultStr = JSON.stringify(result, null, 2);
          const truncated = resultStr.length > 500 ? resultStr.slice(0, 500) + "..." : resultStr;
          logger.debug({ tool: params.description.split("\n")[0].trim(), result: truncated }, "Tool succeeded");
        }

        return result;
      } catch (error) {
        // Properly type the caught error
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
          { tool: params.description.split("\n")[0].trim(), error: errorMessage },
          "Tool execution failed"
        );

        // Return a structured error that the AI can understand
        // If the error is already a ToolResult (from createError), return it directly
        if (error && typeof error === 'object' && 'success' in error && (error as { success?: boolean }).success === false && 'error' in error) {
          return error;
        }

        return createError(
          errorMessage || "Unknown error occurred during tool execution",
          {
            status: error && typeof error === 'object' && 'status' in error ? (error as { status?: number }).status : undefined,
            code: error && typeof error === 'object' && 'code' in error ? (error as { code?: string }).code : undefined,
          },
        );
      }
    },
  });
}
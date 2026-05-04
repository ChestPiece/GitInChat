import { z } from 'zod';

/**
 * Application error codes for granular error handling.
 */
export const ErrorCode = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  AGENT_INIT_FAILED: 'AGENT_INIT_FAILED',
  STREAM_FAILED: 'STREAM_FAILED',
  RAG_FAILED: 'RAG_FAILED',
  MESSAGE_SAVE_FAILED: 'MESSAGE_SAVE_FAILED',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Structured error response sent to clients.
 */
export interface AppError {
  code: ErrorCodeType;
  message: string;
  retryAfter?: number;
  requestId?: string;
}

/**
 * Creates a structured error response.
 */
export function createErrorResponse(
  code: ErrorCodeType,
  userMessage: string,
  options?: {
    status?: number;
    retryAfter?: number;
    requestId?: string;
  }
): Response {
  const body: AppError = {
    code,
    message: userMessage,
    ...(options?.retryAfter && { retryAfter: options.retryAfter }),
    ...(options?.requestId && { requestId: options.requestId }),
  };

  return new Response(JSON.stringify(body), {
    status: options?.status || 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Maps caught errors to application error codes.
 */
export function mapErrorToCode(error: unknown): {
  code: ErrorCodeType;
  status: number;
  retryAfter?: number;
} {
  // Handle known error types first
  if (error instanceof Error) {
    // Rate limiting
    if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
      return { code: ErrorCode.RATE_LIMIT_EXCEEDED, status: 429, retryAfter: 60 };
    }

    // Auth errors
    if (error.message.includes('unauthorized') || error.message.includes('token')) {
      return { code: ErrorCode.UNAUTHORIZED, status: 401 };
    }
  }

  // Default to generic streaming failure
  return { code: ErrorCode.STREAM_FAILED, status: 500 };
}
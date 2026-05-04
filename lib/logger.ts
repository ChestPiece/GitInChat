import pino from 'pino';

/**
 * Structured logger for GitInChat.
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info({ userId }, 'User logged in');
 *   logger.error({ err }, 'Operation failed');
 * 
 * Set LOG_LEVEL env var to control verbosity (trace, debug, info, warn, error, fatal)
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

/**
 * Create a child logger with pre-bound context.
 * Useful for request-scoped logging.
 * 
 * @example
 *   const reqLogger = logger.child({ requestId: crypto.randomUUID() });
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
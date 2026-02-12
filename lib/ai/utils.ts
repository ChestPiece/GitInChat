import { ToolResult } from './types'

export function createSuccess<T>(data: T, metadata?: Record<string, unknown>): ToolResult<T> {
  return { success: true, data, metadata }
}

export function createError<T>(error: string, metadata?: Record<string, unknown>): ToolResult<T> {
  return { success: false, error, metadata }
}

import { ToolResult } from "./types";

export function createSuccess<T>(
  data: T,
  metadata?: Record<string, unknown>,
): ToolResult<T> {
  return { success: true, data, metadata };
}

export function createError<T>(
  error: string,
  metadata?: Record<string, unknown>,
): ToolResult<T> {
  return { success: false, error, metadata };
}

const VALIDATE_REPO_REGEX = /^[a-zA-Z0-9_.-]+$/;
const VALIDATE_PATH_REGEX = /^[\/a-zA-Z0-9_.-]*$/;

export function validateRepoInput(
  owner: string | undefined,
  repo: string | undefined,
): { valid: boolean; error?: string } {
  if (!owner || !repo) {
    return { valid: false, error: "Owner and repo are required" };
  }
  if (!VALIDATE_REPO_REGEX.test(owner)) {
    return {
      valid: false,
      error:
        "Invalid owner format - only alphanumeric, hyphens, underscores, dots allowed",
    };
  }
  if (!VALIDATE_REPO_REGEX.test(repo)) {
    return {
      valid: false,
      error:
        "Invalid repo format - only alphanumeric, hyphens, underscores, dots allowed",
    };
  }
  return { valid: true };
}

export function validatePathInput(path: string | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!path) {
    return { valid: true }; // empty path is ok (root)
  }
  if (!VALIDATE_PATH_REGEX.test(path)) {
    return {
      valid: false,
      error: "Invalid path format - path traversal attempts detected",
    };
  }
  if (path.includes("..") || path.includes("\\")) {
    return { valid: false, error: "Path traversal not allowed" };
  }
  if (
    path.startsWith(".git") ||
    path.includes("/.git") ||
    path.includes("\\.git")
  ) {
    return { valid: false, error: ".git directory access not allowed" };
  }
  return { valid: true };
}

/**
 * Validate numeric parameters (limit, page, count, etc.) to prevent type holes.
 * Ensures values are integers within safe bounds.
 */
export function validateNumericParam(
  value: number | undefined,
  options: {
    name: string;
    min?: number;
    max?: number;
    allowZero?: boolean;
    mustBeInteger?: boolean;
  },
): { valid: boolean; error?: string; value?: number } {
  if (value === undefined || value === null) {
    return { valid: false, error: `${options.name} is required` };
  }

  // Ensure it's a number
  if (typeof value !== "number" || !isFinite(value)) {
    return { valid: false, error: `${options.name} must be a valid number` };
  }

  // Check if integer required
  if (options.mustBeInteger !== false && !Number.isInteger(value)) {
    return { valid: false, error: `${options.name} must be an integer` };
  }

  // Check zero
  if (value === 0 && options.allowZero === false) {
    return { valid: false, error: `${options.name} must be greater than 0` };
  }

  // Check min
  if (options.min !== undefined && value < options.min) {
    return { valid: false, error: `${options.name} must be >= ${options.min}` };
  }

  // Check max
  if (options.max !== undefined && value > options.max) {
    return { valid: false, error: `${options.name} must be <= ${options.max}` };
  }

  return { valid: true, value };
}

/**
 * Sanitize string parameters to remove potential injection patterns.
 */
export function sanitizeStringParam(
  value: string | undefined,
  paramName: string,
): { valid: boolean; error?: string; value?: string } {
  if (!value) {
    return { valid: false, error: `${paramName} is required` };
  }

  // Trim whitespace
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: `${paramName} cannot be empty` };
  }

  // Check for null bytes (common injection vector)
  if (trimmed.includes("\0")) {
    return { valid: false, error: `${paramName} contains invalid characters` };
  }

  // Check for excessive length (DOS prevention)
  if (trimmed.length > 1000) {
    return {
      valid: false,
      error: `${paramName} exceeds maximum length of 1000 characters`,
    };
  }

  return { valid: true, value: trimmed };
}

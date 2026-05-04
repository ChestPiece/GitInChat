import { safetyClient } from '@/lib/safety';

interface GuardUrlResult {
  allowed: boolean;
  error?: string;
  violation_types?: string[];
}

/**
 * Guards a URL before fetching it.
 * Fails open if safety check times out or errors.
 */
export async function guardUrl(url: string): Promise<GuardUrlResult> {
  try {
    const guardPromise = safetyClient.guard({
      input: url
    });

    const timeoutPromise = new Promise<any>((resolve) => 
      setTimeout(() => resolve({ timeout: true }), 800)
    );

    const result = await Promise.race([guardPromise, timeoutPromise]);

    if (result.timeout) {
      console.error("[Safety GuardUrl] Timeout - Blocking in production, allowing in dev");
      if (process.env.NODE_ENV === "production") {
        return { allowed: false, error: "Safety check timeout - blocked in production" };
      }
      return { allowed: true };
    }

    if (result.classification === "block") {
      console.warn("[Safety GuardUrl] Blocked:", result.violation_types);
      return {
        allowed: false,
        error: 'URL blocked by security check',
        violation_types: result.violation_types || []
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("[Safety GuardUrl] Error - Blocking in production:", error);
    if (process.env.NODE_ENV === "production") {
      return { allowed: false, error: "Safety check failed - blocked in production" };
    }
    return { allowed: true };
  }
}

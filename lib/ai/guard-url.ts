import { safetyClient } from "@/lib/safety";

interface GuardUrlResult {
  allowed: boolean;
  error?: string;
  violation_types?: string[];
}

function allowDevSafetyBypass() {
  return (
    process.env.ALLOW_DEV_SAFETY_BYPASS === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

/**
 * Guards a URL before fetching it.
 * Fails closed unless explicit dev bypass is enabled.
 */
export async function guardUrl(url: string): Promise<GuardUrlResult> {
  try {
    const guardPromise = safetyClient.guard({
      input: url,
    });

    const timeoutPromise = new Promise<any>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 800),
    );

    const result = await Promise.race([guardPromise, timeoutPromise]);

    if (result.timeout) {
      console.error("[Safety GuardUrl] Timeout - blocking by default");
      if (allowDevSafetyBypass()) {
        return { allowed: true };
      }
      return { allowed: false, error: "Safety check timeout - blocked" };
    }

    if (result.classification === "block") {
      console.warn("[Safety GuardUrl] Blocked:", result.violation_types);
      return {
        allowed: false,
        error: "URL blocked by security check",
        violation_types: result.violation_types || [],
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("[Safety GuardUrl] Error - blocking by default:", error);
    if (allowDevSafetyBypass()) {
      return { allowed: true };
    }
    return { allowed: false, error: "Safety check failed - blocked" };
  }
}

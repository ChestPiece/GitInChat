"use server";

import { safetyClient } from "@/lib/safety";

function allowDevSafetyBypass() {
  return (
    process.env.ALLOW_DEV_SAFETY_BYPASS === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

interface GuardFileResult {
  success: boolean;
  error?: string;
  violation_types?: string[];
}

export async function guardFile(
  fileData: string,
  mimeType: string,
): Promise<GuardFileResult> {
  try {
    // Extract base64 from data URL format if present
    const base64Data = fileData.includes(",")
      ? fileData.split(",")[1]
      : fileData;

    // Convert to strict buffer/blob for analysis
    const fileBuffer = Buffer.from(base64Data, "base64");
    const fileBlob = new Blob([fileBuffer], { type: mimeType });

    // Race against 800ms timeout for fail-closed unless explicit dev bypass
    const guardPromise = safetyClient.guard({
      input: fileBlob,
    });

    const timeoutPromise = new Promise<any>((resolve, reject) =>
      setTimeout(() => resolve({ timeout: true }), 800),
    );

    const result = await Promise.race([guardPromise, timeoutPromise]);

    if (result.timeout) {
      console.warn("[Safety GuardFile] Timeout - blocking by default");
      if (allowDevSafetyBypass()) {
        return { success: true };
      }
      return { success: false, error: "File safety check timeout - blocked" };
    }

    if (result.classification === "block") {
      console.warn("[Safety GuardFile] Blocked:", result.violation_types);
      return {
        success: false,
        error: "File blocked by security check",
        violation_types: result.violation_types || [],
      };
    }

    return { success: true };
  } catch (error) {
    console.warn("[Safety GuardFile] Error - blocking by default:", error);
    if (allowDevSafetyBypass()) {
      return { success: true };
    }
    return { success: false, error: "File safety check failed - blocked" };
  }
}

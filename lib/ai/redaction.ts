import { safetyClient } from './safety';

interface RedactionResult {
  redacted: string;
  original: string;
  wasRedacted: boolean;
  findings: string[];
}

/**
 * Redacts PII and sensitive data from text using SuperAgent.
 * Fails open (returns original text) if the service is down or slow.
 */
export async function redactContent(input: string): Promise<RedactionResult> {
  if (!input) {
    return { redacted: '', original: '', wasRedacted: false, findings: [] };
  }

  try {
    // 800ms timeout for redaction to prevent UI lag
    const redactionPromise = safetyClient.redact({
      input,
      // Use a fast model for redaction
      model: 'openai/gpt-4o-mini',
      // Explicitly fail open is handled by catch, but we can also set options if needed
    });

    const timeoutPromise = new Promise<any>((resolve, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 800)
    );

    const result = await Promise.race([redactionPromise, timeoutPromise]);

    return {
      redacted: result.redacted,
      original: input,
      wasRedacted: result.redacted !== input,
      findings: result.findings || []
    };
  } catch (error) {
    console.warn('[Safety Redaction] Failed or timed out (Fail Open):', error);
    // Fail open: Return original content
    return {
      redacted: input,
      original: input,
      wasRedacted: false,
      findings: []
    };
  }
}


import { redactContent } from '@/lib/ai/redaction';

async function testRedaction() {
  console.log("🔒 Testing Redaction...");

  const input = "My email is test@example.com and my API key is sk-1234567890abcdef.";
  console.log(`Input: "${input}"`);

  const start = Date.now();
  const result = await redactContent(input);
  const duration = Date.now() - start;

  console.log(`Output: "${result.redacted}"`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Was Redacted: ${result.wasRedacted}`);
  console.log(`Findings:`, result.findings);

  if (result.redacted.includes("test@example.com")) {
      console.error("❌ FAILED: Email was not redacted.");
  } else {
      console.log("✅ PASSED: Email redacted.");
  }
}

testRedaction();

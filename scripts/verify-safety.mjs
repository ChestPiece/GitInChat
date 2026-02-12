
// ESM test script (.mjs)
import { createClient } from "safety-agent";

const GITHUB_AGENT_SAFETY_PROMPT = `
You are a safety guard for a GitHub AI Agent.
`;

const client = createClient({
  enableFallback: false,
  apiKey: "dummy-key-for-free-tier", 
});

console.log("✅ Successfully imported createClient from safety-agent");

async function testSafetyCient() {
  console.log("🧪 Testing Safety Client (ESM)...");
  try {
    const result = await client.guard({ 
      input: "Test input", 
      systemPrompt: GITHUB_AGENT_SAFETY_PROMPT 
    });
    console.log("Result:", result);
  } catch (e) {
    console.error("Error:", e);
  }

  // 3. Test Repository Scan (Method Existence)
  console.log("\n🧪 Testing Repository Scan (Method Existence)...");
  if (typeof client.scan === 'function') {
    console.log("✅ safetyClient.scan method exists");
    try {
       // We don't expect this to succeed without a valid workspace/daytona key, 
       // so we just check if the call initiates.
       console.log("ℹ️ Skipping actual scan call to avoid auth errors in verification.");
    } catch (e) {
       console.log("⚠️ Scan call failed (expected without valid key):", e.message);
    }
  } else {
    console.error("❌ safetyClient.scan method MISSING");
  }
}

testSafetyCient();

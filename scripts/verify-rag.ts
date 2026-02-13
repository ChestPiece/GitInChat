
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { GITHUB_AGENT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables BEFORE importing tools
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Fallback to .env if local is missing
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const query = "How is the webhook handler implemented? I want to know about the dispatcher specifically.";
  
  console.log(`Testing Agentic RAG (Standalone) with query: "${query}"`);
  console.log("---------------------------------------------------");

  try {
    // Dynamic import of tools to ensure env vars are loaded first
    const { searchCodebaseTool } = await import('@/lib/ai/tools/search-codebase');
    const { readProjectFileTool } = await import('@/lib/ai/tools/read-file');

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: GITHUB_AGENT_SYSTEM_PROMPT,
      tools: {
        searchCodebase: searchCodebaseTool,
        readProjectFile: readProjectFileTool,
      },
      maxSteps: 5,
      messages: [
        { role: 'user', content: query }
      ],
      onStepFinish: (step: any) => {
        console.log(`\n[Step ${(step as any).stepType}]`);
        if (step.toolCalls) {
            step.toolCalls.forEach((tc: any) => {
                console.log(`Tool Call: ${tc.toolName}`);
                console.log(`Args: ${JSON.stringify((tc as any).args)}`);
            });
        }
        if (step.toolResults) {
             step.toolResults.forEach((tr: any) => {
                 console.log(`Tool Result (${tr.toolName}):`);
                 const res = (tr as any).result;
                 const str = typeof res === 'string' ? res : JSON.stringify(res) || 'undefined';
                 console.log(str.length > 200 ? str.slice(0, 200) + '...' : str);
             });
        }
      }
    } as any);

    console.log("\n---------------------------------------------------");
    console.log("Final Response:");
    console.log(result.text);

    console.log("\nAnalysis:");
    const steps = result.steps;
    const toolCalls = steps.flatMap(s => s.toolCalls || []);
    const calledSearch = toolCalls.some(tc => tc.toolName === 'searchCodebase');
    const calledRead = toolCalls.some(tc => tc.toolName === 'readProjectFile');

    console.log(`Called searchCodebase: ${calledSearch ? '✅' : '❌'}`);
    console.log(`Called readProjectFile: ${calledRead ? '✅' : '❌'}`);

    if (calledSearch && calledRead) {
        console.log("\n✅ SUCCESS: Agent used both Search and Read tools.");
    } else if (calledSearch) {
        console.log("\n⚠️ PARTIAL: Agent searched but didn't read file.");
    } else {
         // If answer is good, it might be fine without tools?
         // But we WANT it to use tools for this query.
         console.log("\n❌ FAILED: Agent didn't use RAG tools.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();

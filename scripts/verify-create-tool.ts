
import { createTool } from '../lib/ai/create-tool';
import { z } from 'zod';

async function run() {
  console.log('--- Testing Success Case ---');
  const successTool = createTool({
    description: 'A test tool that succeeds',
    inputSchema: z.object({ name: z.string() }),
    execute: async ({ name }) => {
      return { message: `Hello ${name}` };
    }
  });

  // Simulator AI calling the tool
  await successTool.execute({ name: 'World' });


  console.log('\n--- Testing Error Case ---');
  const errorTool = createTool({
    description: 'A test tool that fails',
    inputSchema: z.object({ shouldFail: z.boolean() }),
    execute: async ({ shouldFail }) => {
      if (shouldFail) {
        throw new Error('Simulated failure');
      }
      return { success: true };
    }
  });

  try {
    const result = await errorTool.execute({ shouldFail: true });
    console.log('Error tool result (should be safe error object):', result);
  } catch (e) {
    console.error('CRITICAL: Tool threw exception instead of returning error object!', e);
  }
}

run();

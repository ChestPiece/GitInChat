import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { listRepositories } from '../lib/ai/tools/repository/list';
import { searchRepositoriesTool as searchRepositories } from '../lib/ai/tools/repository/search-repositories';
import { getRepositoryTool as getRepositoryDetails } from '../lib/ai/tools/repository/get-repository';
import { getRepositoryFileContent } from '../lib/ai/tools/repository/get-content';
import { starRepository } from '../lib/ai/tools/repository/star';
import { createRepositoryTool as createRepository } from '../lib/ai/tools/repository/create-repository';
import { updateRepositoryTool as updateRepository } from '../lib/ai/tools/repository/update-repository';
import { deleteRepositoryTool as deleteRepository } from '../lib/ai/tools/repository/delete-repository';

// Load environment variables
dotenv.config({ path: '.env.local' });

const tools = {
  listRepositories,
  searchRepositories,
  getRepositoryDetails,
  getRepositoryFileContent,
  starRepository,
  createRepository,
  updateRepository,
  deleteRepository,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat() {
  console.log('GitHub Chat Verification Script');
  console.log('Type "exit" to quit.');
  console.log('-------------------------------');

  const askQuestion = () => {
    rl.question('User: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      try {
        const { text, toolCalls, toolResults } = await generateText({
          model: openai('gpt-4o'),
          system: 'You are a helpful assistant that can manage GitHub repositories.',
          prompt: input,
          tools: tools,
          maxSteps: 5, // Allow multi-step tool calls
        } as any);

        if (toolCalls && toolCalls.length > 0) {
          console.log('\n[Tool Calls]:');
          toolCalls.forEach(call => {
            const c = call as any;
            console.log(`- ${c.toolName}(${JSON.stringify(c.args)})`);
          });
        }

        if (toolResults && toolResults.length > 0) {
           console.log('\n[Tool Results]:');
           toolResults.forEach(result => {
             // Cast result to any to access properties safely
             const res = result as any;
             console.log(`- ${result.toolName}: ${JSON.stringify(res.result).substring(0, 100)}...`);
           });
        }

        console.log(`\nAssistant: ${text}\n`);
      } catch (error) {
        console.error('Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

chat();


import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// Add tool import
import { createTool } from '../create-tool';

export const readProjectFileTool = createTool({
  description: 'Read the full content of a file from the project. Use this when you need detailed context beyond search snippets, or when you want to examine a specific file mentioned in search results.',
  inputSchema: z.object({
    filePath: z.string().describe('Relative path to the file (e.g., "lib/auth.ts" or "components/ui/button.tsx").'),
  }),
  execute: async ({ filePath }: { filePath: string }) => {
    try {
      const projectRoot = process.cwd();
      const absolutePath = path.resolve(projectRoot, filePath);

      // Security check: Ensure path is within project root
      if (!absolutePath.startsWith(projectRoot)) {
        return { error: "Access denied: Cannot read files outside the project root." };
      }

      // Security check: Prevent reading sensitive files
      if (filePath.includes('.env') || filePath.includes('node_modules') || filePath.includes('.git')) {
        return { error: "Access denied: Cannot read sensitive or system files." };
      }

      const content = await fs.readFile(absolutePath, 'utf-8');
      
      // Truncate if too huge (e.g. > 100kb) to prevent context window explosion
      // but generous enough for most code files
      if (content.length > 100000) {
         return { 
             content: content.slice(0, 100000) + "\n...[File truncated due to size]...",
             truncated: true
         };
      }

      return { content };
    } catch (error: any) {
      return { error: `Failed to read file: ${error.message}` };
    }
  },
});

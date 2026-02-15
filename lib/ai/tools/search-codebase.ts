
import { createTool } from '../create-tool';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findRelevantContent(userQuery: string, limit = 5) {
  // 1. Generate embedding for user query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: userQuery,
  });

  // 2. Search Supabase
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.3, // Similarity threshold
    match_count: limit,
  });

  if (error) {
    console.error('Error searching codebase:', error);
    throw error;
  }

  return data;
}

export const searchCodebaseTool = createTool({
  description: 'Search the entire project codebase for relevant code snippets, patterns, or definitions using semantic search. Use this when you need to understand how something is implemented across files, find definitions, or locate specific logic.',
  inputSchema: z.object({
    query: z.string().describe('The code-related question or search query (e.g., "how is auth handled?", "where is the chat component defined?")'),
    limit: z.number().optional().default(5).describe('Number of results to return (default 5)'),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }) => {
    try {
      const results = await findRelevantContent(query, limit);

      if (!results || results.length === 0) {
        return "No relevant code found in the codebase index.";
      }

      // Format results for the agent
      const formatted = results.map((doc: any) => `
[File: ${doc.metadata?.filePath}]
\`\`\`typescript
${doc.content}
\`\`\`
(Similarity: ${doc.similarity.toFixed(2)})
`).join('\n---\n');

      return `Found ${results.length} relevant snippets:\n${formatted}`;
    } catch (error: any) {
      return `Error searching codebase: ${error.message}`;
    }
  },
});

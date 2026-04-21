import { createTool } from '../create-tool';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { searchSimilarDocuments } from '@/lib/rag/search';

export const searchCodebaseTool = createTool({
  description:
    'Search the entire project codebase for relevant code snippets, patterns, or definitions using semantic search. Use this when you need to understand how something is implemented across files, find definitions, or locate specific logic.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'The code-related question or search query (e.g., "how is auth handled?", "where is the chat component defined?")'
      ),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Number of results to return (default 5)'),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        return 'Semantic code search requires an authenticated session.';
      }

      const results = await searchSimilarDocuments(query, {
        userId: user.id,
        limit,
        threshold: 0.3,
      });

      if (!results || results.length === 0) {
        return 'No relevant code found in the codebase index.';
      }

      const formatted = results
        .map(
          (doc) => `
[File: ${doc.metadata?.file_path ?? 'unknown'}]
\`\`\`typescript
${doc.content}
\`\`\`
(Similarity: ${doc.similarity.toFixed(2)})
`
        )
        .join('\n---\n');

      return `Found ${results.length} relevant snippets:\n${formatted}`;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return `Error searching codebase: ${message}`;
    }
  },
});

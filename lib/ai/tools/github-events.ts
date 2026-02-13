import { tool } from 'ai';
import { z } from 'zod';
import { getRecentEvents } from '@/lib/services/events';

export const getRecentEventsTool = tool({
  description: 'Get the most recent GitHub events (pushes, PRs, issues) that happened in the repository. Use this to answer "what happened today?" or "what is the team working on?".',
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Number of events to return'),
  }),
  execute: async ({ limit }: { limit: number }) => {
    const events = await getRecentEvents(limit);
    return events.map(e => ({
      type: e.type,
      description: e.payload.description,
      title: e.payload.title,
      date: new Date(e.created_at).toLocaleString(),
      actor: e.actor
    }));
  },
});

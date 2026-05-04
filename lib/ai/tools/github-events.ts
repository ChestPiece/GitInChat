import { createTool } from '../create-tool';

import { z } from 'zod';
import { getRecentEvents } from '@/lib/services/events';
import { createClient } from '@/lib/supabase/server';

export const getRecentEventsTool = createTool({
  description: 'Get the most recent GitHub events (pushes, PRs, issues) that happened in the repository. Use this to answer "what happened today?" or "what is the team working on?".',
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Number of events to return'),
  }),
  execute: async ({ limit }: { limit: number }) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      return { error: 'Not authenticated' };
    }
    const events = await getRecentEvents(userId, limit);
    return events.map(e => ({
      type: e.type,
      description: e.payload.description,
      title: e.payload.title,
      date: new Date(e.created_at).toLocaleString(),
      actor: e.actor
    }));
  },
});

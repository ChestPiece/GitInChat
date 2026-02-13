import { supabaseAdmin } from '@/lib/supabase/admin';

export interface GithubEventPayload {
  type: string;
  title: string;
  description: string;
  repo: string;
  meta: Record<string, any>;
}

/**
 * Persists a standardized GitHub event to the database.
 * This is used for the Activity Feed and AI context.
 */
export async function saveGithubEvent(payload: GithubEventPayload) {
  try {
    const { error } = await supabaseAdmin
      .from('github_events')
      .insert({
        type: payload.type,
        payload: payload, // Store the whole simplified payload for easy rendering
        repo_name: payload.repo,
        actor: payload.description.split(':')[0] || 'System', // Simple heuristic for actor
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Events Service] Failed to save event:', error);
      // We don't throw here to prevent failing the webhook response
    } else {
      console.log('[Events Service] Event saved to DB');
    }
  } catch (err) {
    console.error('[Events Service] Unexpected error:', err);
  }
}

/**
 * Fetches recent GitHub events for the AI context or UI.
 */
export async function getRecentEvents(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('github_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Events Service] Failed to fetch events:', error);
    return [];
  }
  return data;
}

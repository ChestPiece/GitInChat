import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

export async function getGitHubClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.provider_token) {
    throw new Error('GitHub token not found. Please log in.');
  }

  return new Octokit({
    auth: session.provider_token,
  });
}

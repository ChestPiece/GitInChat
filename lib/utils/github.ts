import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

export async function getGitHubClient() {
  const supabase = await createClient();
  const envToken = process.env.GITHUB_ACCESS_TOKEN;

  if (envToken) {
    return new Octokit({ auth: envToken });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Not authenticated.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.provider_token;
  if (!token) {
    throw new Error('GitHub token not found. Please log in or set GITHUB_ACCESS_TOKEN in .env');
  }

  return new Octokit({ auth: token });
}

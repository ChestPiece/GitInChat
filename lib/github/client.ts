import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

export async function getGitHubClient() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const token = process.env.GITHUB_ACCESS_TOKEN || session?.provider_token;

  if (!token) {
    throw new Error('GitHub token not found. Please log in or set GITHUB_ACCESS_TOKEN in .env');
  }

  return new Octokit({
    auth: token,
  });
}

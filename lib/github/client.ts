import { Octokit } from 'octokit';
import { createClient } from '@/lib/supabase/server';

export async function getGitHubClient() {
  const token = process.env.GITHUB_ACCESS_TOKEN;

  if (token) {
    return new Octokit({
      auth: token,
    });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    throw new Error('GitHub token not found. Please log in or set GITHUB_ACCESS_TOKEN in .env');
  }

  return new Octokit({
    auth: session.provider_token,
  });
}

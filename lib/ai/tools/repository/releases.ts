import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listReleasesSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  limit: z.number().min(1).max(100).optional().describe('Number of releases to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listReleases = createTool({
  description: 'List releases of a repository. Use this to see published versions and their details.',
  inputSchema: listReleasesSchema,
  execute: async ({ owner, repo, limit = 30 }: z.infer<typeof listReleasesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: limit,
      });
      
      return createSuccess({
        total: data.length,
        releases: data.map(release => ({
          id: release.id,
          tag_name: release.tag_name,
          name: release.name,
          draft: release.draft,
          prerelease: release.prerelease,
          created_at: release.created_at,
          published_at: release.published_at,
          author: release.author?.login,
          body: release.body?.substring(0, 300) || '',
          html_url: release.html_url,
          assets_count: release.assets?.length || 0,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list releases');
    }
  },
});

const getReleaseDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  release_id: z.number().optional().describe('Release ID. If not provided, gets latest release.'),
  tag: z.string().optional().describe('Tag name to get release by tag'),
});

export const getReleaseDetails = createTool({
  description: 'Get details of a specific release or the latest release.',
  inputSchema: getReleaseDetailsSchema,
  execute: async ({ owner, repo, release_id, tag }: z.infer<typeof getReleaseDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      let data;
      
      if (tag) {
        const response = await octokit.rest.repos.getReleaseByTag({ owner, repo, tag });
        data = response.data;
      } else if (release_id) {
        const response = await octokit.rest.repos.getRelease({ owner, repo, release_id });
        data = response.data;
      } else {
        const response = await octokit.rest.repos.getLatestRelease({ owner, repo });
        data = response.data;
      }
      
      return createSuccess({
        id: data.id,
        tag_name: data.tag_name,
        name: data.name,
        draft: data.draft,
        prerelease: data.prerelease,
        created_at: data.created_at,
        published_at: data.published_at,
        author: data.author?.login,
        body: data.body || '',
        html_url: data.html_url,
        tarball_url: data.tarball_url,
        zipball_url: data.zipball_url,
        assets: data.assets?.map(asset => ({
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          download_url: asset.browser_download_url,
        })),
      });
    } catch (error: any) {
      if (error.status === 404) {
        return createError('No releases found for this repository');
      }
      return createError(error.message || 'Failed to get release details');
    }
  },
});

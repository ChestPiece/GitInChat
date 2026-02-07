import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/utils/github';

export const listRepositories = tool({
  description: 'List the repositories of the authenticated user. Use this to see what repos the user has.',
  parameters: z.object({
    sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Property to sort by. Default: updated.'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction. Default: desc.'),
    limit: z.number().min(1).max(100).optional().describe('Number of repos to return. Default: 30.'),
    visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility. Default: all.'),
  }),
  execute: async ({ sort = 'updated', direction = 'desc', limit = 30, visibility = 'all' }) => {
    const octokit = await getGitHubClient();
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: sort as "created" | "updated" | "pushed" | "full_name" | undefined,
      direction: direction as "asc" | "desc" | undefined,
      per_page: limit,
      visibility: visibility as "all" | "public" | "private" | undefined,
    });
    return data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description,
      html_url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      updated_at: repo.updated_at,
    }));
  },
});

export const searchRepositories = tool({
  description: 'Search for repositories on GitHub. Use this to find repos by name or topic.',
  parameters: z.object({
    query: z.string().describe('Search query (e.g., "user:moeez react", "language:typescript topic:ai")'),
    sort: z.enum(['stars', 'forks', 'updated']).optional().describe('Sort field'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    limit: z.number().min(1).max(100).optional().describe('Number of results. Default: 10.'),
  }),
  execute: async ({ query, sort, order, limit = 10 }) => {
    const octokit = await getGitHubClient();
    const { data } = await octokit.rest.search.repos({
      q: query,
      sort,
      order,
      per_page: limit,
    });
    return data.items.map(repo => ({
      full_name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      html_url: repo.html_url,
    }));
  },
});

export const getRepositoryDetails = tool({
  description: 'Get detailed information about a specific repository.',
  parameters: z.object({
    owner: z.string().describe('Owner of the repository'),
    repo: z.string().describe('Name of the repository'),
  }),
  execute: async ({ owner, repo }) => {
    const octokit = await getGitHubClient();
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return {
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      open_issues: data.open_issues_count,
      language: data.language,
      created_at: data.created_at,
      updated_at: data.updated_at,
      default_branch: data.default_branch,
      html_url: data.html_url,
      visibility: data.visibility,
    };
  },
});

export const starRepository = tool({
  description: 'Star or unstar a repository. Requires user to be authenticated.',
  parameters: z.object({
    owner: z.string().describe('Owner of the repository'),
    repo: z.string().describe('Name of the repository'),
    action: z.enum(['star', 'unstar']).describe('Action to perform'),
  }),
  execute: async ({ owner, repo, action }) => {
    const octokit = await getGitHubClient();
    if (action === 'star') {
      await octokit.rest.activity.starRepoForAuthenticatedUser({ owner, repo });
      return { success: true, message: `Starred ${owner}/${repo}` };
    } else {
      await octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo });
      return { success: true, message: `Unstarred ${owner}/${repo}` };
    }
  },
});

export const getRepositoryFileContent = tool({
  description: 'Get the content of a file in a repository. Use this to read code or config files.',
  parameters: z.object({
    owner: z.string().describe('Owner of the repository'),
    repo: z.string().describe('Name of the repository'),
    path: z.string().describe('Path to the file'),
  }),
  execute: async ({ owner, repo, path }) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(data) || (data as any).type !== 'file') {
        return { error: 'Path is a directory or submodule, not a file.' };
      }

      // Content is base64 encoded
      // Cast data to any because strict Octokit types make this difficult to narrow
      const content = Buffer.from((data as any).content, 'base64').toString('utf-8');
      
      // Truncate if too large to avoid context window issues (e.g. > 20kb)
      if (content.length > 20000) {
         return { 
             content: content.slice(0, 20000) + '\n...(truncated)', 
             truncated: true,
             message: 'File content truncated because it is too large.'
         };
      }

      return { content };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch file content' };
    }
  },
});

// ... existing tools ...

// ... existing tools ...

// ... existing tools ...

export const createRepository = tool({
  description: 'Create a new GitHub repository.',
  parameters: z.object({
    name: z.string().describe('Name of the repository'),
    description: z.string().optional().describe('Description of the repository'),
    private: z.boolean().optional().describe('Whether the repository should be private. Default: false.'),
    auto_init: z.boolean().optional().describe('Whether to initialize the repository with a README. Default: true.'),
  }),
  execute: async ({ name, description, private: isPrivate = false, auto_init = true }: { name: string, description?: string, private?: boolean, auto_init?: boolean }) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init,
      });
      return {
        success: true,
        message: `Created repository ${data.full_name}`,
        repository: {
          name: data.name,
          full_name: data.full_name,
          html_url: data.html_url,
          private: data.private,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

export const updateRepository = tool({
  description: 'Update an existing GitHub repository. Can change description, visibility, homepage, or archive/unarchive.',
  parameters: z.object({
    owner: z.string().describe('Owner of the repository'),
    repo: z.string().describe('Name of the repository'),
    description: z.string().optional().describe('New description'),
    homepage: z.string().optional().describe('New homepage URL'),
    private: z.boolean().optional().describe('Update visibility (true for private, false for public)'),
    archived: z.boolean().optional().describe('Update archive state (true to archive, false to unarchive)'),
  }),
  execute: async ({ owner, repo, description, homepage, private: isPrivate, archived }: { owner: string, repo: string, description?: string, homepage?: string, private?: boolean, archived?: boolean }) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.update({
        owner,
        repo,
        description,
        homepage,
        private: isPrivate,
        archived,
      });
      return {
        success: true,
        message: `Updated repository ${owner}/${repo}`,
        repository: {
          full_name: data.full_name,
          description: data.description,
          private: data.private,
          archived: data.archived,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

export const deleteRepository = tool({
  description: 'Delete a GitHub repository. EXTREMELY DANGEROUS. Requires explicit confirmation.',
  parameters: z.object({
    owner: z.string().describe('Owner of the repository'),
    repo: z.string().describe('Name of the repository'),
  }),
  execute: async ({ owner, repo }: { owner: string, repo: string }) => {
    const octokit = await getGitHubClient();
    try {
      await octokit.rest.repos.delete({
        owner,
        repo,
      });
      return { success: true, message: `Deleted repository ${owner}/${repo}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

export const tools = {
  listRepositories,
  searchRepositories,
  getRepositoryDetails,
  starRepository,
  getRepositoryFileContent,
  createRepository,
  updateRepository,
  deleteRepository,
};

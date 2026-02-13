
import { listRepositories } from './repository/list';
import { countRepositories } from './repository/count';
import { searchRepositoriesTool } from './repository/search-repositories';
import { getRepositoryTool } from './repository/get-repository';
import { getRepositoryFileContent } from './repository/get-content';
import { starRepository } from './repository/star';
import { createRepositoryTool } from './repository/create-repository';
import { updateRepositoryTool } from './repository/update-repository';
import { deleteRepositoryTool } from './repository/delete-repository';
import { archiveRepositoryTool } from './repository/archive-repository';
import { listBranches, getBranchDetails } from './repository/branches';
import { listCommits, getCommitDetails } from './repository/commits';
import { listContributors } from './repository/contributors';
import { listIssues, getIssueDetails } from './repository/issues';
import { listPullRequests, getPullRequestDetails } from './repository/pull-requests';
import { getLanguages } from './repository/languages';
import { listReleases, getReleaseDetails } from './repository/releases';
import { listTags } from './repository/tags';
import { scanRepository } from './repository/scan';
import { getRecentEventsTool } from './github-events';
import { searchCodebaseTool } from './search-codebase';
import { readProjectFileTool } from './read-file';
import { indexRepositoryTool, getIndexStatsTool } from './rag/index-repository';

export const tools = {
  // Discovery (Read-only)
  listRepositories,
  countRepositories,
  getRepository: getRepositoryTool,
  searchRepositories: searchRepositoriesTool,
  getRepositoryFileContent,
  getLanguages,
  
  // Management (Write operations)
  createRepository: createRepositoryTool,
  updateRepository: updateRepositoryTool,
  archiveRepository: archiveRepositoryTool,
  deleteRepository: deleteRepositoryTool,
  starRepository,
  
  // Branches
  listBranches,
  getBranchDetails,
  
  // Commits
  listCommits,
  getCommitDetails,
  
  // Contributors
  listContributors,
  
  // Issues
  listIssues,
  getIssueDetails,
  
  // Pull Requests
  listPullRequests,
  getPullRequestDetails,
  
  // Releases & Tags
  listReleases,
  getReleaseDetails,
  listTags,

  // Security
  scanRepository,

  // Events
  getRecentEvents: getRecentEventsTool,

  // Knowledge
  searchCodebase: searchCodebaseTool,
  readProjectFile: readProjectFileTool,

  // RAG
  indexRepository: indexRepositoryTool,
  getIndexStats: getIndexStatsTool,
};

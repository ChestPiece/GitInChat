
import { listRepositories } from './repository/list';
import { countRepositories } from './repository/count';
import { searchRepositories } from './repository/search';
import { getRepositoryDetails } from './repository/get-details';
import { getRepositoryFileContent } from './repository/get-content';
import { starRepository } from './repository/star';
import { createRepository } from './repository/create';
import { updateRepository } from './repository/update';
import { deleteRepository } from './repository/delete';
import { listBranches, getBranchDetails } from './repository/branches';
import { listCommits, getCommitDetails } from './repository/commits';
import { listContributors } from './repository/contributors';
import { listIssues, getIssueDetails } from './repository/issues';
import { listPullRequests, getPullRequestDetails } from './repository/pull-requests';
import { getLanguages } from './repository/languages';
import { listReleases, getReleaseDetails } from './repository/releases';
import { listTags } from './repository/tags';

export const tools = {
  // Repository listing & search
  listRepositories,
  countRepositories,
  searchRepositories,
  getRepositoryDetails,
  getRepositoryFileContent,
  getLanguages,
  
  // Repository actions
  starRepository,
  createRepository,
  updateRepository,
  deleteRepository,
  
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
};




import { listRepositories } from './repository/list';
import { searchRepositories } from './repository/search';
import { getRepositoryDetails } from './repository/get-details';
import { getRepositoryFileContent } from './repository/get-content';
import { starRepository } from './repository/star';
import { createRepository } from './repository/create';
import { updateRepository } from './repository/update';
import { deleteRepository } from './repository/delete';

export const tools = {
  listRepositories,
  searchRepositories,
  getRepositoryDetails,
  getRepositoryFileContent,
  starRepository,
  createRepository,
  updateRepository,
  deleteRepository,
};

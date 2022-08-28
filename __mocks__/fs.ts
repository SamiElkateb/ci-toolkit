import { vi } from 'vitest';
import CONFIG_PATHS from '../__fixtures__/configPaths';
import {
  CREATE_MERGE_REQUEST, GET_CURRENT_BRANCH_NAME, GET_CURRENT_PROJECT_NAME, STANDARD_CONFIG,
} from '../__fixtures__/configurations';
import { TOKEN_PATH } from '../__fixtures__/paths';
import addCommandToConfig from '../__fixtures__/addCommandToConfig';

const writeFileSync = vi.fn(() => true);
const readFileSync = vi.fn((path: string) => {
  switch (path) {
    case CONFIG_PATHS.getCurrentProjectNameConfig:
      return addCommandToConfig(STANDARD_CONFIG, GET_CURRENT_PROJECT_NAME);
    case CONFIG_PATHS.getCurrentBranchNameConfig:
      return addCommandToConfig(STANDARD_CONFIG, GET_CURRENT_BRANCH_NAME);
    case CONFIG_PATHS.createMergeRequestConfig:
      return addCommandToConfig(STANDARD_CONFIG, CREATE_MERGE_REQUEST);
    case TOKEN_PATH:
      return 'super_secret_token';
    default:
      throw new Error(`Mock: could not find file ${path}.`);
  }
});

const existsSync = vi.fn((path: string) => {
  // if (path.includes(CONFIG_PATH)) return true;
  switch (path) {
    case CONFIG_PATHS.createMergeRequestConfig:
    case CONFIG_PATHS.getCurrentProjectNameConfig:
    case CONFIG_PATHS.getCurrentBranchNameConfig:
    case TOKEN_PATH:
      return true;
    default:
      return false;
  }
});

export { writeFileSync, existsSync, readFileSync };

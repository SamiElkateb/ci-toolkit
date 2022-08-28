import { vi } from 'vitest';
import { GIT_GET_BRANCH, GIT_REMOTE } from '../__fixtures__/commands';
import { GIT_BRANCH_RESPONSE, GIT_REMOTE_RESPONSE } from '../__fixtures__/responses/git';

const execSync = vi.fn((command: string) => {
  switch (command) {
    case GIT_GET_BRANCH:
      return GIT_BRANCH_RESPONSE;
    case GIT_REMOTE:
      return GIT_REMOTE_RESPONSE;
    default:
      throw new Error(`Mock: could not find command ${command}.`);
  }
});

// eslint-disable-next-line import/prefer-default-export
export { execSync };

import { vi } from 'vitest';
import { CONFIG_PATH, TOKEN_PATH } from '../__fixtures__/paths';
import { STANDARD_CONFIG } from '../__fixtures__/configurations';

const writeFileSync = vi.fn(() => true);
const readFileSync = vi.fn((path: string) => {
  if (path.includes(CONFIG_PATH)) return JSON.stringify(STANDARD_CONFIG);

  switch (path) {
    case TOKEN_PATH:
      return 'super_secret_token';
    default:
      throw new Error(`Mock: could not find file ${path}.`);
  }
});

const existsSync = vi.fn((path: string) => {
  if (path.includes(CONFIG_PATH)) return true;
  switch (path) {
    case TOKEN_PATH:
      return true;
    default:
      return false;
  }
});

export { writeFileSync, existsSync, readFileSync };

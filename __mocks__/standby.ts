import { vi } from 'vitest';

const standby = vi.fn(async () => new Promise((resolve) => {
  resolve(true);
}));
export default standby;

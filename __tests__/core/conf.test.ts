import {
  vi, describe, beforeAll, it, expect,
} from 'vitest';
import Logger from '../../lib/core/Logger';
import Runner from '../../lib/core/Runner';

process.argv[2] = 'test';
// process.env.cwd = '.';
describe('Configuration', () => {
  beforeAll(() => {
    vi.mock('fs');
  });
  it('should not throw if provided with a valid configuration file', async () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error');

    await Runner.start('test');
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

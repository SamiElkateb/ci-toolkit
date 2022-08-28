import {
  vi, describe, beforeAll, it, expect,
} from 'vitest';
import Logger from '../../lib/core/Logger';
import Runner from '../../lib/core/Runner';
import CONFIG_PATHS from '../../__fixtures__/configPaths';

describe('get_current_branch_name', () => {
  beforeAll(() => {
    vi.mock('fs');
    vi.mock('child_process');
  });
  it('should log the current branch name', async () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error');
    const infoSpy = vi.spyOn(Logger.prototype, 'info');

    await Runner.start({ run: 'test_command', config: CONFIG_PATHS.getCurrentBranchNameConfig });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(infoSpy.mock.calls[0]).toMatch(/new-branch/);
  });
});

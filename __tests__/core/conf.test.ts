import {
  vi, describe, beforeAll, it, expect,
} from 'vitest';
import Logger from '../../lib/core/Logger';
import Runner from '../../lib/core/Runner';
import CONFIG_PATHS from '../../__fixtures__/configPaths';

describe('Configuration', () => {
  beforeAll(() => {
    vi.mock('fs');
    vi.mock('child_process');
  });
  it('should not log and error if provided with a valid configuration file and a valid command', async () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error');

    await Runner.start({ run: 'test_command', config: CONFIG_PATHS.getCurrentBranchNameConfig });
    expect(errorSpy).not.toHaveBeenCalled();
  });
  it('should log and error if provided with a valid configuration file and an invalid command', async () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error');
    await Runner.start({ run: 'non_existing_command', config: CONFIG_PATHS.getCurrentBranchNameConfig });
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0]).toMatch(/non_existing_command does not seem to exist in your commands/);
  });
  it('should log and error if provided with no configuration file', async () => {
    const errorSpy = vi.spyOn(Logger.prototype, 'error');
    await Runner.start({ run: 'non_existing_command', config: CONFIG_PATHS.nonExistingConfig });
    expect(errorSpy).toHaveBeenCalled();
    expect(errorSpy.mock.calls[0]).toMatch(/does not exist/);
  });
});

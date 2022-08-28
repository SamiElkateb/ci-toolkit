import {
  vi, describe, beforeAll, it, expect, beforeEach, afterEach,
} from 'vitest';
import Logger from '../../lib/core/Logger';
import Runner from '../../lib/core/Runner';
import CONFIG_PATHS from '../../__fixtures__/configPaths';
import workingServer from '../../__mocks__/workingServer';

describe('create_merge_request', () => {
  let errorSpy = vi.spyOn(Logger.prototype, 'error');
  let infoSpy = vi.spyOn(Logger.prototype, 'info');

  beforeAll(() => {
    vi.mock('../../lib/utils/standby');
    vi.mock('fs');
    vi.mock('child_process');
    workingServer();
  });

  beforeEach(() => {
    errorSpy = vi.spyOn(Logger.prototype, 'error');
    infoSpy = vi.spyOn(Logger.prototype, 'info');
  });

  afterEach(() => {
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('should log the current branch name', async () => {
    errorSpy = vi.spyOn(Logger.prototype, 'error');
    infoSpy = vi.spyOn(Logger.prototype, 'info');

    await Runner.start({ run: 'test_command', config: CONFIG_PATHS.createMergeRequestConfig });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(infoSpy.mock.calls[0]).toMatch(/new-branch/);
  });
});

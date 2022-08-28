import {
  vi, describe, beforeAll, it, expect, beforeEach, afterEach,
} from 'vitest';
import Logger from '../../lib/core/Logger';
import Runner from '../../lib/core/Runner';
import CONFIG_PATHS from '../../__fixtures__/configPaths';

describe('get_current_project_name', () => {
  let errorSpy = vi.spyOn(Logger.prototype, 'error');
  let infoSpy = vi.spyOn(Logger.prototype, 'info');
  beforeAll(() => {
    vi.mock('fs');
    vi.mock('child_process');
  });
  beforeEach(() => {
    errorSpy = vi.spyOn(Logger.prototype, 'error');
    infoSpy = vi.spyOn(Logger.prototype, 'info');
  });
  afterEach(() => {
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });
  it('should log the current project name', async () => {
    await Runner.start({ run: 'test_command', config: CONFIG_PATHS.getCurrentProjectNameConfig });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(infoSpy.mock.calls[0]).toMatch(/JohnDoe%2Ftestproject/);
  });
});

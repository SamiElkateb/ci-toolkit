import { CommandOptions, InitialConfigFile } from '../lib/models/config';

const addCommandToConfig = (config:InitialConfigFile, command:CommandOptions) => (JSON.stringify({
  ...config,
  commands: {
    test_command: [{ ...command }],
  },
}));
export default addCommandToConfig;

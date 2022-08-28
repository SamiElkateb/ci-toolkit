import { CommandOptions, InitialConfigFile } from '../lib/models/config';

const addCommandToConfig = (config:InitialConfigFile, commands:CommandOptions[]) => JSON.stringify({
  ...config,
  commands: {
    test_command: commands,
  },
}, null, '\t');
export default addCommandToConfig;

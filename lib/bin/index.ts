#! /usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { cliArgsSchema, initSchema } from '../models/args';
import Runner from '../core/Runner';

const initDescription = `Initializes the current project by creating a default template at the root of the project:
- 1 ci-toolkit.yml config file
- 1 .ci-toolkit folder containing config files
`;

const yarg = yargs(hideBin(process.argv))
  .usage('Usage: (npx|npm) $0 [options]')
  .options({
    c: {
      alias: 'config',
      default: './ci-toolkit.yml',
      describe: 'provides a path to an alternate config file',
      type: 'string',
      requiresArg: true,
      nargs: 1,
    },
    r: {
      alias: 'run',
      describe: 'runs a custom command defined in the config files',
      type: 'string',
      requiresArg: true,
      nargs: 1,
    },
    i: {
      alias: 'init',
      describe: initDescription,
      type: 'boolean',
    },
  })
  .example('$0 --init', 'Initializes the current projet')
  .example('$0 --run=merge_and_tag', 'Runs the custom command merge_and_tag')
  .example('$0 --run=deploy --config="./.ci-toolkit/ci-toolkit.yml"', 'Runs the custom command deploy and uses a custom config')
  .alias('v', 'version')
  .version('0.1.0')
  .help('h')
  .alias('h', 'help')
  .strict()
  .strictOptions()
  .wrap(null)
  .showHelpOnFail(true);

const argv = cliArgsSchema.safeParse(yarg.argv);
const init = initSchema.safeParse(yarg.argv);
if (argv.success) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Runner.start(argv.data);
} else if (init.success) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  Runner.init();
} else {
  yarg.showHelp();
}

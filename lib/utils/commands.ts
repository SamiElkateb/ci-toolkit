import { execSync } from 'child_process';
import Logger from '../core/Logger';
import {
  assertCommitMessageValidCharacters,
  assertCommitMessageValidLength,
  assertPathExists,
} from './assertions/customTypesAssertions';
import {
  checkIsObject,
  checkIsString,
  hasOwnProperty,
} from './validations/basicTypeValidations';

const execProm = (command: string): Promise<string> => new Promise((resolve, reject) => {
  try {
    resolve(execSync(command).toString());
  } catch (error) {
    let errorText = 'exited with';
    let errorMessage = '';
    if (checkIsObject(error)) {
      if (hasOwnProperty(error, 'status')) {
        errorText = `${errorText} error code ${error.status}`;
      } else {
        errorText = `${errorText} an error`;
      }
      if (hasOwnProperty(error, 'stderr')) {
        if (error.stderr instanceof Buffer) {
          errorMessage = error.stderr.toString();
        }
        if (!errorMessage && checkIsString(error.stderr)) {
          errorMessage = error.stderr;
        }
      }
      if (!errorMessage && hasOwnProperty(error, 'message')) {
        if (!errorMessage && error.message instanceof Buffer) {
          errorMessage = error.message.toString();
        }
        if (!errorMessage && checkIsString(error.message)) {
          errorMessage = error.message;
        }
      }
      if (!errorMessage && hasOwnProperty(error, 'stdout')) {
        if (error.stdout instanceof Buffer && !errorMessage) {
          errorMessage = error.stdout.toString();
        }
        if (checkIsString(error.stdout) && !errorMessage) {
          errorMessage = error.stdout;
        }
      }
    }
    if (errorMessage.length > 0) {
      reject(new Error(`${errorText}, ${errorMessage}`));
    } else {
      reject(errorText);
    }
  }
});
const appendCommitMessage = (command: string, message: string) => {
  const whitelistedCommands = [
    'git commit -m',
    'git commit -a -m',
    'git add . && git commit -m',
  ];
  if (!whitelistedCommands.includes(command)) {
    throw new Error(`Appending "${message}" to command "${command}" is not allowed.`);
  }
  assertCommitMessageValidLength(message);
  assertCommitMessageValidCharacters(message);
  return `${command} "${message}"`;
};

const appendBranch = (command: string, branch: string) => {
  const whitelistedCommands = [
    'git pull origin',
    'git push -u origin',
    'git diff',
    'git diff -U99999',
    'git show',
  ];
  if (!whitelistedCommands.includes(command)) {
    throw new Error(`Appending "${branch}" to command "${command}" is not allowed.`);
  }
  assertCommitMessageValidLength(branch);
  assertCommitMessageValidCharacters(branch);
  if (command === 'git pull origin') {
    return `${command} ${branch} --ff`;
  }
  return `${command} ${branch}`;
};
const appendBranches = (command: string, branches: string[]) => {
  const whitelistedCommands = [
    'git pull origin',
    'git push -u origin',
    'git diff',
    'git diff -U99999',
    'git show',
  ];
  if (!whitelistedCommands.includes(command)) {
    throw new Error(`Appending "${branches}" to command "${command}" is not allowed.`);
  }
  branches.forEach((branch) => {
    assertCommitMessageValidLength(branch);
    assertCommitMessageValidCharacters(branch);
  });
  const finalCommand = branches.reduce(
    (acc, branch) => `${acc} ${branch}`,
    command,
  );
  if (command === 'git pull origin') {
    return `${finalCommand} --ff`;
  }
  return finalCommand;
};
const prependPath = (command: string, path: string) => {
  if (path) assertPathExists(path);
  return `cd "${path}" && ${command}`;
};

const appendPath = (command: string, path: string) => {
  if (path) assertPathExists(path);
  return `${command}${path}`;
};

const assertIsWhitelistedCommand = (command: string) => {
  const whitelistedCommands = [
    'git rev-parse --abbrev-ref HEAD',
    'git remote -v',
    'git commit',
    'git commit -a',
    'git commit -m',
    'git commit -a -m',
    'git add . && git commit',
    'git add . && git commit -m',
    'git push',
    'git push -u origin',
    'git pull',
    'git pull origin',
    'git status',
    'git show',
    'git diff',
    'git diff -U99999',
  ];
  if (!whitelistedCommands.includes(command)) throw new Error('Invalid command');
};
type ExecCommandOptions = {
  command: string;
  path?: string;
  pathToAppend?: string;
  message?: string;
  branch?: string;
  branches?: string[];
  logger: Logger;
};
const execCommand = async (options: ExecCommandOptions) => {
  const {
    command: baseCommand,
    path,
    message,
    branch,
    branches,
    pathToAppend,
    logger,
  } = options;
  assertIsWhitelistedCommand(baseCommand);
  let command = baseCommand;
  if (message) command = appendCommitMessage(command, message);
  if (branch) command = appendBranch(command, branch);
  if (branches) command = appendBranches(command, branches);
  if (path) command = prependPath(command, path);
  if (pathToAppend) command = appendPath(command, pathToAppend);
  //! should log command before executing?
  logger.warn(`Will execute command: ${command}`, 'Continue?');
  const data = await execProm(command);
  return data;
};

export { execCommand, execProm };

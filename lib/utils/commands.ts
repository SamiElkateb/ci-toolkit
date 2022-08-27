import { execSync } from 'child_process';
import { z } from 'zod';
import Logger from '../core/Logger';
import { commitMessageValidationSchema } from '../models/others';
import { assertFileExists } from './files';

const execProm = (command: string): Promise<string> => new Promise((resolve, reject) => {
  try {
    resolve(execSync(command).toString());
  } catch (error) {
    let errorText = 'exited with';
    let errorMessage = '';
    const stringOrBuffer = z.string().or(z.instanceof(Buffer));

    const parsedErrorWithStderr = z.object({
      status: z.string().optional(),
      stderr: stringOrBuffer,
    }).safeParse(error);
    const parsedErrorWithMessage = z.object({
      status: z.string().optional(),
      message: stringOrBuffer,
    }).safeParse(error);
    const parsedErrorWithStdout = z.object({
      status: z.string().optional(),
      stdout: stringOrBuffer,
    }).safeParse(error);

    if (parsedErrorWithStderr.success) {
      const { status, stderr } = parsedErrorWithStderr.data;
      errorText = status ? `${errorText} error code ${status}` : `${errorText} an error`;
      errorMessage = stderr.toString();
    } else if (parsedErrorWithMessage.success) {
      const { status, message } = parsedErrorWithMessage.data;
      errorText = status ? `${errorText} error code ${status}` : `${errorText} an error`;
      errorMessage = message.toString();
    } else if (parsedErrorWithStdout.success) {
      const { status, stdout } = parsedErrorWithStdout.data;
      errorText = status ? `${errorText} error code ${status}` : `${errorText} an error`;
      errorMessage = stdout.toString();
    }

    if (errorMessage.length > 0) {
      reject(new Error(`${errorText}, ${errorMessage}`));
    } else {
      reject(new Error(errorText));
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
  const parsedCommitMessage = commitMessageValidationSchema.parse(message);
  return `${command} "${parsedCommitMessage}"`;
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
  const parsedBranch = commitMessageValidationSchema.parse(branch);
  if (command === 'git pull origin') {
    return `${command} ${parsedBranch} --ff`;
  }
  return `${command} ${parsedBranch}`;
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
    const branchesString = branches.reduce((acc, curr) => {
      const branchesAcc = `${acc} ${curr}`;
      return branchesAcc;
    }, '');
    throw new Error(`Appending "${branchesString}" to command "${command}" is not allowed.`);
  }
  branches.forEach((branch) => {
    commitMessageValidationSchema.parse(branch);
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
  if (path) assertFileExists(path);
  return `cd "${path}" && ${command}`;
};

const appendPath = (command: string, path: string) => {
  if (path) assertFileExists(path);
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
  await logger.warn(`Will execute command: ${command}`, 'Continue?');
  const data = await execProm(command);
  return data;
};

export { execCommand, execProm };

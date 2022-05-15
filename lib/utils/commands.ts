import { execSync } from 'child_process';
import {
	assertCommitMessageValidCharacters,
	assertCommitMessageValidLength,
	assertPath,
	assertPathExists,
} from './assertions/customTypesAssertions';
import {
	checkIsObject,
	checkIsString,
	hasOwnProperty,
} from './validations/basicTypeValidations';

type commands = 'help';
const help = () => {
	const message = `npx ci-toolkit <command> \n
	help		
	init		initializes ci-toolkit by creating default config files
	create-mr	create a merge request for the current branch
	deploy		merge the merge request associated with the current branch
	`;
	console.log(message);
};
const functions = {
	help: help,
};
const parseCommand = () => {
	const args = process.argv;
	const commands: commands[] = [];
	const options = [];
	args.forEach((arg) => {
		if (arg === 'help') commands.push(arg);
		//if (arg === 'deploy') commands.push(arg);
		//if (arg === 'create-mr') commands.push(arg);
	});
	if (commands.length > 1 || commands.length === 0) {
		help();
		return;
	}
	if (commands.length === 1) functions[commands[0]]();
};

const execProm = (command: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			resolve(execSync(command).toString());
		} catch (error) {
			let errorText = `exited with`;
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
				reject(`${errorText}, ${errorMessage}`);
			} else {
				reject(errorText);
			}
		}
	});
};
const appendString = (command: string, message: string) => {
	const whitelistedCommands = [
		'git commit -m',
		'git commit -a -m',
		'git add . && git commit -m',
		'git pull origin',
		'git push -u origin',
	];
	if (!whitelistedCommands.includes(command)) {
		throw `Appending "${message}" to append message to command "${command}" is not allowed.`;
	}
	assertCommitMessageValidLength(message);
	assertCommitMessageValidCharacters(message);
	return `${command} "${message}"`;
};

const prependPath = (command: string, path: string) => {
	if (path) assertPathExists(path);
	return `cd "${path}" && ${command}`;
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
		'git pull origin ',
		'git status',
	];
	if (!whitelistedCommands.includes(command)) throw 'Invalid command';
};
type execCommandOptions = {
	command: string;
	path?: string;
	message?: string;
	branch?: string;
};
const execCommand = async (options: execCommandOptions) => {
	const { command: baseCommand, path, message, branch } = options;
	assertIsWhitelistedCommand(baseCommand);
	let command = baseCommand;
	if (message) command = appendString(command, message);
	if (branch) command = appendString(command, branch);
	if (path) command = prependPath(command, path);

	const data = await execProm(command);
	return data;
};

export { execCommand };

import { message } from 'prompt';
import {
	assertCommitMessageValidCharacters,
	assertCommitMessageValidLength,
	assertPath,
	assertPathExists,
} from './assertions/customTypesAssertions';
const util = require('util');
const { exec } = require('child_process');
const execProm = util.promisify(exec);

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

const appendString = (command: string, message: string) => {
	const whitelistedCommands = ['git commit -m', 'git pull origin'];
	if (!whitelistedCommands.includes(command)) {
		throw `Appending "${message}" to append message to command "${command}" is not allowed.`;
	}
	assertCommitMessageValidLength(message);
	assertCommitMessageValidCharacters(message);
	return `${command} ${message}`;
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
		'git push',
		'git pull',
		'git pull origin ',
	];
	if (!whitelistedCommands.includes(command)) throw 'Invalid command';
};
type execCommandOptions = {
	command: string;
	path?: string;
	message?: string;
};
const execCommand = async (options: execCommandOptions) => {
	const { command: baseCommand, path, message } = options;
	assertIsWhitelistedCommand(baseCommand);
	let command = baseCommand;
	if (message) command = appendString(command, message);
	if (path) command = prependPath(command, path);

	const data = await execProm(command);
	return data;
};

export { execCommand };

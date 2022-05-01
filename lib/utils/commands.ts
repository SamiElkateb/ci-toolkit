import { assertPath, assertPathExists } from './assertions';
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
const whitelistedCommands = [
	'git rev-parse --abbrev-ref HEAD',
	'git remote -v',
];

const execCommand = async (initialCommand: string, path?: string) => {
	if (!whitelistedCommands.includes(initialCommand)) throw 'Invalid command';
	if (path) assertPathExists(path);
	const command = path ? `cd ${path} && ${initialCommand}` : initialCommand;
	const data = await execProm(command);
	return data;
};

export { execCommand };

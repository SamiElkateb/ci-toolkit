import { getConfig } from '../utils';
import ErrorHandler from './Errors/ErrorHandler';
import Git from './Git';
import Conf from './Gitlab/Conf';
import Gitlab from './Gitlab/Gitlab';

type commands = 'help' | 'deploy' | 'createMergeRequest';
type options = 'help';

class Runner {
	constructor() {}

	static help = (options?: options[]) => {
		const message = `npx ci-toolkit <command>
Commands:
        help		
		config		
        create-mr	create a merge request for the current branch
        deploy		merge the merge request associated with the current branch
        `;
		console.log(message);
	};

	static start = () => {
		const args = process.argv;
		const commands: commands[] = [];
		const options: options[] = [];
		args.forEach((arg) => {
			const parsedArg = Runner.parseArgs(arg);
			if (typeof parsedArg.command !== 'undefined')
				commands.push(parsedArg.command);
			if (typeof parsedArg.option !== 'undefined')
				options.push(parsedArg.option);
		});
		if (commands.length > 1 || commands.length === 0) {
			Runner.help();
			return;
		}
		if (commands.length === 1) {
			ErrorHandler.try(() => {
				Runner[commands[0]](options);
			});
		}
	};

	static deploy = async (options?: options[]) => {
		const configFile = getConfig();
		if (!configFile) throw 'No config file was found';
		const parsedConfig = await Conf.parseConfig(configFile);
		const conf = new Conf(parsedConfig);
		const gitlab = new Gitlab(conf);
		const branchName = await Git.getCurrentBranchName();
		const mergeRequest = await gitlab.mergeRequests.get(branchName);
		gitlab.mergeRequests.verify(mergeRequest);
		await gitlab.mergeRequests.merge(mergeRequest);
		const tags = await gitlab.tags.getLast();
	};

	static createMergeRequest = (options?: options[]) => {
		console.log('mergeRequest');
	};

	static parseArgs = (
		arg: string
	): { command?: commands; option?: options } => {
		console.log('mergeRequest');
		if (arg === 'help') return { command: 'help' };
		if (arg === 'deploy') return { command: 'deploy' };
		if (arg === 'create-mr') return { command: 'createMergeRequest' };
		if (arg === '--help') return { option: 'help' };
		return {};
	};
}
export default Runner;

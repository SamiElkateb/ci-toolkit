import ErrorHandler from './Errors/ErrorHandler';
import Git from './Git';
import Conf from './Conf';
import Gitlab from './Gitlab/Gitlab';
import { assertExists } from '../utils/assertions';
import lang from './lang/en';
import Log from './Log';
import Tags from './Gitlab/Tags';
import { updatePackageJson } from '../utils/files';

type commands = 'help' | 'deploy' | 'createMergeRequest';
type options = 'help';
type params = {
	conf: Conf;
	options?: options[];
};
const logger = new Log();
class Runner {
	constructor() {}

	static help = (params?: params) => {
		const message = lang.help;
		console.log(message);
	};

	static start = async () => {
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
			ErrorHandler.try(async () => {
				const conf = await Runner.getConf();
				await Runner[commands[0]]({ options, conf });
			});
		}
	};

	static getConf = async () => {
		logger.debug('getting config file');
		const configFile = Conf.getConfigFile();
		if (!configFile) throw 'No config file was found';
		logger.debug('parsing config file');
		const parsedConfig = await Conf.parseConfig(configFile);
		const conf = new Conf(parsedConfig);
		logger.setLogLevel(conf.logLevel);
		return conf;
	};

	static deploy = async (params: params) => {
		logger.info('starting deployment');
		await updatePackageJson();
		await Runner.mergeCurrentBranch(params);
		await Runner.tagMainBranch(params);
	};

	static mergeCurrentBranch = async (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
		const branchName = await Git.getCurrentBranchName();
		logger.info(lang.currentBranchIs(branchName));
		const mergeRequest = await gitlab.mergeRequests.get(branchName);
		logger.info(lang.foundMr(mergeRequest.title));
		gitlab.mergeRequests.verify(mergeRequest);
		logger.info(lang.mrMeetsRequirements(mergeRequest.title));
		//await gitlab.mergeRequests.merge(mergeRequest);
		logger.info(
			lang.merging(mergeRequest.source_branch, mergeRequest.target_branch)
		);
	};

	static tagMainBranch = async (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
		const tag = await gitlab.tags.getLast();
		logger.info(lang.currentTag(tag));
		const newTag = await Tags.increaseTag({ tag, update: 'minor' });
		logger.info(lang.newTag(newTag));
	};

	static createMergeRequest = (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
	};

	static parseArgs = (
		arg: string
	): { command?: commands; option?: options } => {
		if (arg === 'help') return { command: 'help' };
		if (arg === 'deploy') return { command: 'deploy' };
		if (arg === 'create-mr') return { command: 'createMergeRequest' };
		if (arg === '--help') return { option: 'help' };
		return {};
	};
}
export default Runner;

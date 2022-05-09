import ErrorHandler from './Errors/ErrorHandler';
import prompt = require('prompt');
import Git from './Git';
import Conf from './Conf';
import Gitlab from './Gitlab/Gitlab';
import {
	assertCommandOptionsValid,
	assertPath,
	assertPathExists,
	assertVarKey,
} from '../utils/assertions/customTypesAssertions';
import {
	assertObject,
	assertProperty,
} from '../utils/assertions/baseTypeAssertions';
import lang from './lang/en';
import Log from './Log';
import Tags from './Gitlab/Tags';
import { getAbsolutePath, updatePackageJson } from '../utils/files';
import { poll } from '../utils/polling';
import {
	checkIsCommandName,
	checkIsVarKey,
} from '../utils/validations/customTypeValidation';
import { defaultConfig } from './defaultConfig';
import {
	assertArray,
	assertExists,
	assertString,
} from '../utils/assertions/baseTypeAssertions';

type commands = 'help' | 'deploy' | 'createMergeRequest';
type options = 'help';
type params = {
	conf: Conf;
	options?: options[];
};
interface store {
	[key: string]: string;
}
const logger = new Log();
class Runner {
	store: store;
	constructor() {
		this.store = {};
	}

	static help = (params?: params) => {
		const message = lang.help;
		console.log(message);
	};

	static start = async () => {
		// const runner = new Runner();
		// const options = {
		// 	question: 'What version?',
		// 	store: '$_increment',
		// };
		// runner.assertPromptOptions(options);
		// runner.prompt(options);
		// return;
		const args = process.argv;
		const command = args[2];
		ErrorHandler.try(async () => {
			const conf = await Runner.getConf();
			await Runner.runCustomCommand(command, conf);
		});
	};
	static runCustomCommand = async (customCommandKey: string, conf: Conf) => {
		assertProperty(conf.commands, customCommandKey);
		const commands = conf.commands[customCommandKey];
		assertArray(commands);
		const runner = new Runner();
		for (let i = 0, c = commands.length; i < c; i++) {
			const commandName = Runner.getCommandName(commands[i]);
			assertExists(commandName);
			assertProperty(runner, commandName);
			const commandsOptions = commands[i];
			if (checkIsCommandName(commandName)) {
				assertProperty(commandsOptions, commandName);
				const data = commandsOptions[commandName];
				await runner[commandName](commandsOptions[commandName], conf);
			}
		}
		console.log(runner.store);
	};

	static getCommandName = (command: object) => {
		for (const property in command) {
			return property;
		}
	};

	static getConf = async () => {
		logger.debug('getting config file');
		const configFile = Conf.readConfigFile();
		if (!configFile) throw 'No config file was found';
		logger.debug('parsing config file');
		const parsedConfig = await Conf.parseConfig(configFile);
		const conf = new Conf(parsedConfig);
		logger.setLogLevel(conf.logLevel);
		return conf;
	};

	static deploy = async (params: params) => {
		logger.info('starting deployment');
		const project2 = getAbsolutePath('../test2');
		const branchName = await Git.getBranchName(project2);
		console.log(branchName);
		const { options, conf } = params;
		//console.log(conf.deployment);
		// const gitlab = new Gitlab(conf);
		// await gitlab.pipelines.post();
		// const pollingData = {
		// 	fn: gitlab.pipelines.arePipelineRunning,
		// 	timeoutMessage: 'timeout exceeded',
		// 	pollingLogFn: () => {
		// 		logger.debug('polling pipelines');
		// 	},
		// };
		// await poll(pollingData);
		// const failedPipelines = gitlab.pipelines.getFailedPipelines();
		// console.log('failed pipelines', failedPipelines);
		//await gitlab.pipelines.get(526296226);
		// await updatePackageJson();
		// await Runner.mergeCurrentBranch(params);
		// await Runner.tagMainBranch(params);
	};
	/* 
	static mergeCurrentBranch = async (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
		const branchName = await Git.getBranchName();
		logger.info(lang.currentBranchIs(branchName));
		const mergeRequest = await gitlab.mergeRequests.get(branchName);
		logger.info(lang.foundMr(mergeRequest.title));
		gitlab.mergeRequests.verify(mergeRequest);
		logger.info(lang.mrMeetsRequirements(mergeRequest.title));
		//await gitlab.mergeRequests.merge(mergeRequest);
		logger.info(
			lang.merging(mergeRequest.source_branch, mergeRequest.target_branch)
		);
	}; */

	/* static updateEnvDiffs = async (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
		const tag = await gitlab.tags.getLast();
		logger.info(lang.currentTag(tag));
		const newTag = await Tags.increaseTag({ tag, update: 'minor' });
		logger.info(lang.newTag(newTag));
	}; */

	/* static tagMainBranch = async (params: params) => {
		const { options, conf } = params;
		const gitlab = new Gitlab(conf);
		const tag = await gitlab.tags.getLast();
		logger.info(lang.currentTag(tag));
		const newTag = await Tags.increaseTag({ tag, update: 'minor' });
		logger.info(lang.newTag(newTag));
	}; */

	// static createMergeRequest = async (params: params) => {
	// 	const { options, conf } = params;
	// 	const shouldAssignToMe = conf.mergeRequests.creation.assignToMe;
	// 	const gitlab = new Gitlab(conf);
	// 	const sourceBranch = await Git.getBranchName();
	// 	logger.info(lang.currentBranchIs(sourceBranch));
	// 	const assigneeId = shouldAssignToMe
	// 		? (await gitlab.users.getMe()).id
	// 		: undefined;
	// 	const reviewers = conf.mergeRequests.creation.reviewers;
	// 	const reviewerIds = await gitlab.users.getIds(reviewers);
	// 	await gitlab.mergeRequests.post({
	// 		assigneeId,
	// 		sourceBranch,
	// 		reviewerIds,
	// 	});
	// 	logger.info('Merge request created');
	// };

	static parseArgs = (
		arg: string
	): { command?: commands; option?: options } => {
		if (arg === 'help') return { command: 'help' };
		if (arg === 'deploy') return { command: 'deploy' };
		if (arg === 'create-mr') return { command: 'createMergeRequest' };
		if (arg === '--help') return { option: 'help' };
		return {};
	};

	prompt = async (options: unknown, _: Conf) => {
		assertCommandOptionsValid(options, 'prompt');
		const { store, question } = options;
		assertVarKey(store);
		prompt.start();
		const key = store.replace('$_', '');
		const { value } = await prompt.get([
			{
				description: question,
				name: 'value',
				required: true,
			},
		]);
		assertString(value);
		this.store[key] = value;
	};

	getCurrentBranchName = async (options: unknown, _: Conf) => {
		logger.debug('Getting current branch name');
		assertCommandOptionsValid(options, 'getCurrentBranchName');
		const { store } = options;
		assertVarKey(store);
		const key = store.replace('$_', '');
		const branchName = await Git.getBranchName();
		logger.info(`Current branch name is ${branchName}`);
		this.store[key] = branchName;
		logger.debug(`Storing branch name as ${key}`);
	};

	getCurrentProjectName = async (options: unknown, _: Conf) => {
		logger.debug('Getting current project name');
		assertCommandOptionsValid(options, 'getCurrentProjectName');
		const { store } = options;
		assertVarKey(store);
		const key = store.replace('$_', '');
		const projectName = await Git.getProjectName();
		logger.info(`Current project name is ${projectName}`);
		this.store[key] = encodeURIComponent(projectName);
		logger.debug(`Storing project name as ${key}`);
	};

	getLastTag = async (options: unknown, conf: Conf) => {
		logger.debug('Getting last tag');
		assertCommandOptionsValid(options, 'getLastTag');
		if (checkIsVarKey(options.project)) {
			options.project = this.populateVariable(options.project);
		}
		const { store, project } = options;
		assertVarKey(store);
		const fetchOptions = {
			project: options.project || conf.getProject(),
			domain: options.domain || conf.getDomain(),
			protocole: options.protocole || conf.getProtocole(),
			token: conf.getToken(),
		};
		const tag = await Tags.fetchLast(fetchOptions);
		logger.info(`Last tag is ${tag}`);
		const key = store.replace('$_', '');
		this.store[key] = tag;
		logger.debug(`Storing project name as ${key}`);
	};

	getCurrentVersion = async (options: unknown, _: Conf) => {
		logger.debug('Getting current version');
		assertCommandOptionsValid(options, 'getCurrentVersion');
		const { file, store } = options;
		assertVarKey(store);
		const key = store.replace('$_', '');
		assertPath(file);
		assertPathExists(file);
		const data = await Conf.getLinkedFile(file);
		assertObject(data);
		assertProperty(data, 'version');
		const version = data.version;
		assertString(version);
		logger.info(`Current version is ${version}`);
		this.store[key] = version;
		logger.debug(`Storing version as ${key}`);
	};

	commit = async (options: unknown, _: Conf) => {
		const branchName = await Git.getBranchName();
		logger.debug(`Committing changes in branch ${branchName}`);
		assertCommandOptionsValid(options, 'commit');
		const { message } = options;
		assertString(message);
		const projectName = await Git.commit(message);
	};

	populateVariable = (store: string): string => {
		const key = store.replace('$_', '');
		assertExists(this.store[key]);
		return this.store[key];
	};
}
export default Runner;

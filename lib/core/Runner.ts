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
	assertVersion,
	assertVersionIncrement,
} from '../utils/assertions/customTypesAssertions';
import {
	assertObject,
	assertProperty,
} from '../utils/assertions/baseTypeAssertions';
import lang from './lang/en';
import Logger from './Logger';
import Tags from './Gitlab/Tags';
import { getAbsolutePath, writeVersion } from '../utils/files';
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
import { standby } from '../utils/standby';
import Users from './Gitlab/Users';
import Pipelines from './Gitlab/Pipelines';
import MergeRequests from './Gitlab/MergeRequests';
import { checkIsArray } from '../utils/validations/basicTypeValidations';

type commands = 'help' | 'deploy' | 'createMergeRequest';
type options = 'help';
type params = {
	conf: Conf;
	options?: options[];
};

type awaitPipelineParams = {
	conf: Conf;
	options: Partial<gitlabApiOptions>;
	source: string;
	ref?: string;
};
interface store {
	[key: string]: string;
}
const logger = new Logger();
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
			standby(1000);
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
		logger.setWarningAction(conf.warningAction);
		logger.setLang(conf.lang);
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

	createMergeRequest = async (options: unknown, conf: Conf) => {
		logger.debug('Creating merge request');
		assertCommandOptionsValid(options, 'createMergeRequest');
		options.project = this.populateVariable(options.project);
		options.title = this.populateVariable(options.title);
		options.sourceBranch = this.populateVariable(options.sourceBranch);
		options.targetBranch = this.populateVariable(options.targetBranch);
		const apiOptions = conf.getApiOptions(options);
		const postOptions: mergeRequestsPostOptions = {
			...apiOptions,
			title: options.title,
			targetBranch: options.targetBranch,
			sourceBranch: options.sourceBranch,
			minApprovals: options.minApprovals || 0,
			deleteSourceBranch: options.deleteSourceBranch || false,
			squashCommits: options.squashCommits || false,
			label: options.label,
			assigneeId: undefined,
			reviewerIds: [],
		};
		if (options.assignToMe === true) {
			const myUserData = await Users.fetchMe(apiOptions, logger);
			const myId = myUserData.id;
			postOptions.assigneeId = myId;
		}
		if (checkIsArray(options.reviewers)) {
			const reviewers = options.reviewers;
			const reviewerIds = await Users.fetchIds({
				...apiOptions,
				usernames: reviewers,
			});
			postOptions.reviewerIds = reviewerIds;
		}
		await MergeRequests.post(postOptions, logger);
		logger.info('Merge request created');
		if (options.awaitPipeline) {
			const awaitPipelineParams = {
				options,
				conf,
				source: 'merge_request_event',
			};
			await Runner.awaitPipeline(awaitPipelineParams);
		}
	};

	mergeMergeRequest = async (options: unknown, conf: Conf) => {
		logger.debug('Merging merge request');
		assertCommandOptionsValid(options, 'mergeMergeRequest');
		options.project = this.populateVariable(options.project);
		options.sourceBranch = this.populateVariable(options.sourceBranch);
		options.targetBranch = this.populateVariable(options.targetBranch);
		const apiOptions = conf.getApiOptions(options);
		const mergeOptions = {
			...apiOptions,
			targetBranch: options.targetBranch,
			sourceBranch: options.sourceBranch,
			deleteSourceBranch: options.deleteSourceBranch || undefined,
			squashCommits: options.squashCommits || undefined,
		};
		const mergeRequest = await MergeRequests.fetch(mergeOptions);

		MergeRequests.verify(options, mergeRequest);
		await MergeRequests.merge(mergeOptions, mergeRequest, logger);
		logger.info('Merge request merged');
		if (options.awaitPipeline) {
			const awaitPipelineParams = {
				options,
				conf,
				source: 'push',
				ref: options.targetBranch,
			};
			await Runner.awaitPipeline(awaitPipelineParams);
		}
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
		this.store[key] = projectName;
		logger.debug(`Storing project name as ${key}`);
	};

	fetchLastTag = async (options: unknown, conf: Conf) => {
		logger.debug('Getting last tag');
		assertCommandOptionsValid(options, 'fetchLastTag');
		options.project = this.populateVariable(options.project);
		const { store } = options;
		assertVarKey(store);
		const fetchOptions = conf.getApiOptions(options);
		const tag = await Tags.fetchLast(fetchOptions);
		logger.info(`Last tag is ${tag}`);
		const key = store.replace('$_', '');
		this.store[key] = tag;
		logger.debug(`Storing project name as ${key}`);
	};

	readCurrentVersion = async (options: unknown, _: Conf) => {
		logger.debug('Getting current version');
		assertCommandOptionsValid(options, 'readCurrentVersion');
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

	writeVersion = async (options: unknown, _: Conf) => {
		logger.debug('Setting new version');
		assertCommandOptionsValid(options, 'writeVersion');
		options.newVersion = this.populateVariable(options.newVersion);
		const { files, newVersion } = options;
		assertVersion(newVersion);
		files.forEach((file) => {
			assertPath(file);
			assertPathExists(file);
		});
		for (let i = 0, c = files.length; i < c; i++) {
			const file = files[i] as path;
			writeVersion(file, newVersion);
			logger.info(`Setting version to ${newVersion} in ${file}`);
		}
	};

	incrementVersion = async (options: unknown, _: Conf) => {
		logger.debug(`Incrementing version`);
		assertCommandOptionsValid(options, 'incrementVersion');
		options.incrementBy = this.populateVariable(options.incrementBy);
		options.incrementFrom = this.populateVariable(options.incrementFrom);
		const { incrementBy, incrementFrom, store } = options;
		assertVarKey(store);
		const key = store.replace('$_', '');
		assertVersionIncrement(incrementBy);
		const incrementedVersion = Tags.incrementVersion({
			incrementBy,
			version: incrementFrom,
		});
		logger.info(`Incremented version is ${incrementedVersion}`);
		this.store[key] = incrementedVersion;
		logger.debug(`Storing version as ${key}`);
	};

	commit = async (options: unknown, _: Conf) => {
		const branchName = await Git.getBranchName();
		logger.info(`Committing changes in branch ${branchName}`);
		assertCommandOptionsValid(options, 'commit');
		await Git.commit(options, logger);
		logger.debug(`Changes have been committed`);
	};

	pull = async (options: unknown, _: Conf) => {
		const currentBranchName = await Git.getBranchName();
		logger.debug(`Pulling changes`);
		assertCommandOptionsValid(options, 'pull');
		const { branch } = options;
		if (branch) {
			assertString(branch);
			logger.info(
				`Pulling changes from origin ${branch} to ${currentBranchName}`
			);
		}
		await Git.pull(branch);
		logger.debug(`Pulling successful`);
	};

	push = async (options: unknown, conf: Conf) => {
		const currentBranchName = await Git.getBranchName();
		const project = await Git.getProjectName();
		logger.debug(`Pushing changes`);
		assertCommandOptionsValid(options, 'push');
		const { branch, awaitPipeline } = options;
		if (branch) {
			assertString(branch);
			logger.info(`Pushing changes from ${branch} to origin`);
		}
		await Git.push(branch);
		logger.debug(`Push successful`);
		if (awaitPipeline) {
			const awaitPipelineParams = {
				options: { project, ...options },
				conf,
				source: 'push',
				ref: currentBranchName,
			};
			await Runner.awaitPipeline(awaitPipelineParams);
		}
	};

	static awaitPipeline = async (params: awaitPipelineParams) => {
		await standby(5000);
		const { options, conf, source, ref } = params;
		const fetchOptions = conf.getApiOptions(options);
		const currentUser = await Users.fetchMe(fetchOptions, logger);
		const pipelines = new Pipelines(conf);
		const fetchAllOptions = {
			username: currentUser.username,
			ref,
			source,
			...fetchOptions,
		};
		const allPipelines = await pipelines.fetchAll(fetchAllOptions);
		if (allPipelines.length === 0 || allPipelines[0].status === 'success') {
			return;
		}
		pipelines.pushRunningPipeline(allPipelines[0].id);
		const pollingData = {
			fn: async () => await pipelines.arePipelineRunning(fetchOptions),
			timeoutMessage: 'timeout exceeded',
			pollingLogFn: () => {
				logger.debug('polling pipelines');
			},
		};
		await poll(pollingData);
		const failedPipelines = pipelines.getFailedPipelines();
		if (failedPipelines.length > 0) throw 'Failed pipelines';
	};

	populateVariable = (store: string): string => {
		if (!checkIsVarKey(store)) return store;
		const varKey = store.match(/\$\_\w*/);
		if (!varKey || varKey?.length === 0) return store;
		const key = varKey[0].replace('$_', '');
		assertExists(this.store[key]);
		return this.store[key];
	};
}
export default Runner;

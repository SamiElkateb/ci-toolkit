import ErrorHandler from './Errors/ErrorHandler';
import prompt = require('prompt');
import Git from './Git';
import fs = require('fs');
import Conf from './Conf';
import YAML = require('yaml');
import omit = require('lodash.omit');
import merge = require('lodash.merge');
import { detailedDiff } from 'deep-object-diff';

import {
    assertPathExists,
    assertVersionIncrement,
} from '../utils/assertions/customTypesAssertions';
import { assertProperty } from '../utils/assertions/baseTypeAssertions';
import lang from './lang/en';
import Logger from './Logger';
import Tags from './Gitlab/Tags';
import { getAbsolutePath, writeVersion } from '../utils/files';
import { poll } from '../utils/polling';
import {
    checkIsCommandName,
    checkIsVarKey,
} from '../utils/validations/customTypeValidation';
import {
    assertArray,
    assertExists,
} from '../utils/assertions/baseTypeAssertions';
import { standby } from '../utils/standby';
import Users from './Gitlab/Users';
import Pipelines from './Gitlab/Pipelines';
import MergeRequests from './Gitlab/MergeRequests';
import { assertContinue } from '../utils/assertions/assertContinue';
import ERROR_MESSAGES from '../constants/ErrorMessages';
import getObjectPaths from '../utils/flattenObject';
import { z } from 'zod';
import {
    applyDiffsOptionSchema,
    fetchLastTagOptionSchema,
    createTagOptionSchema,
    getCurrentBranchNameOptionSchema,
    getCurrentProjectNameOptionSchema,
    promptOptionSchema,
    readCurrentVersionOptionSchema,
    getDiffsOptionSchema,
    promptDiffsOptionSchema,
    writeVersionOptionSchema,
    incrementVersionOptionSchema,
    createMergeRequestOptionSchema,
    mergeMergeRequestOptionSchema,
    commitOptionSchema,
    pullOptionSchema,
    pushOptionSchema,
} from '../models/config';
import { packageSchema } from '../models/others';

type commands = 'help' | 'deploy' | 'createMergeRequest';
type options = 'help';
type params = {
    conf: Conf;
    options?: options[];
};

type awaitPipelineParams = {
    conf: Conf;
    options: Partial<gitlabApiOptions>;
    source?: string;
    ref?: string;
};
interface awaitMergeAvailableOptions extends gitlabApiOptions {
    sourceBranch: string;
}

interface store {
    [key: string]: string;
}
interface diffStore {
    [key: string]: diffType;
}
const logger = new Logger();
class Runner {
    store: store;
    diffStore: diffStore;
    constructor() {
        this.store = {};
        this.diffStore = {};
    }

    static help = (params?: params) => {
        const message = lang.help;
        console.log(message);
    };

    static start = async () => {
        const args = process.argv;
        const command = args[2];
        ErrorHandler.try(async () => {
            assertExists(command, 'No command provided');
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
            const commandsOptions = commands[i];
            if (checkIsCommandName(commandName)) {
                assertProperty(commandsOptions, commandName);
                await runner[commandName](commandsOptions[commandName], conf);
            }
            await standby(1000);
        }
    };

    static getCommandName = (command: object) => {
        for (const property in command) {
            return property;
        }
    };

    static getConf = async () => {
        logger.debug('getting config file');
        const configFile = Conf.readConfigFile();
        if (!configFile) throw new Error(ERROR_MESSAGES.noConfig);
        logger.debug('parsing config file');
        const parsedConfig = await Conf.parseConfig(configFile);
        const conf = new Conf(parsedConfig);
        logger.setLogLevel(conf.logLevel);
        logger.setWarningAction(conf.warningAction);
        logger.setLang(conf.lang);
        return conf;
    };

    createMergeRequest = async (userOptions: unknown, conf: Conf) => {
        logger.debug('Creating merge request');
        const options = createMergeRequestOptionSchema.parse(userOptions);
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

        if (options.assignToMe) {
            const myUserData = await Users.fetchMe(apiOptions, logger);
            const myId = myUserData.id;
            postOptions.assigneeId = myId;
        }

        const reviewers = options.reviewers;
        const reviewerIds = await Users.fetchIds({
            ...apiOptions,
            usernames: reviewers,
        });
        postOptions.reviewerIds = reviewerIds;

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

    mergeMergeRequest = async (userOptions: unknown, conf: Conf) => {
        logger.debug('Merging merge request');
        const options = mergeMergeRequestOptionSchema.parse(userOptions);
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
        if (mergeRequest.merge_status !== 'can_be_merged') {
            logger.info(
                'merge request cannot be merged at the moment, checking if pipelines are running for merge request.'
            );
            await Runner.awaitMergeAvailable(mergeOptions, conf);
        }

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

    prompt = async (userOptions: unknown, _: Conf) => {
        const options = promptOptionSchema.parse(userOptions);
        const { store, question } = options;
        prompt.start();
        const { value } = await prompt.get([
            {
                description: question,
                name: 'value',
                required: true,
            },
        ]);
        const validatedValue = z.string().parse(value);
        this.addToStore(store, validatedValue);
    };

    getCurrentBranchName = async (userOptions: unknown, _: Conf) => {
        logger.debug('Getting current branch name');
        const options = getCurrentBranchNameOptionSchema.parse(userOptions);
        const { store } = options;
        const branchName = await Git.getBranchName();
        logger.info(`Current branch name is ${branchName}`);
        this.addToStore(store, branchName);
    };

    getCurrentProjectName = async (userOptions: unknown, _: Conf) => {
        logger.debug('Getting current project name');
        const options = getCurrentProjectNameOptionSchema.parse(userOptions);
        const { store } = options;
        const projectName = await Git.getProjectName();
        logger.info(`Current project name is ${projectName}`);
        this.addToStore(store, projectName);
    };

    getDiffs = async (userOptions: unknown, _: Conf) => {
        logger.debug('Getting Diffs');
        const options = getDiffsOptionSchema.parse(userOptions);
        options.sourceBranch = this.populateVariable(options.sourceBranch);
        options.targetBranch = this.populateVariable(options.targetBranch);
        const { store, sourceBranch, targetBranch } = options;
        const sourceFile = await Git.show(sourceBranch, options.file);
        const sourceObj = YAML.parse(sourceFile);
        const targetFile = await Git.show(targetBranch, options.file);
        const targetObj = YAML.parse(targetFile);
        const diffs = detailedDiff(sourceObj, targetObj) as diffType;
        this.addToDiffStore(store, diffs);
    };

    promptDiffs = async (userOptions: unknown, _: Conf) => {
        logger.debug('Prompt Diffs');
        const options = promptDiffsOptionSchema.parse(userOptions);
        const diffs = this.populateDiffs(options.diffs);
        const add = getObjectPaths(diffs?.added);
        const remove = getObjectPaths(diffs?.deleted);
        const update = getObjectPaths(diffs?.updated);
        logger.diffs({ add, remove, update });
        // TODO: store verified diffs and add modification
        await assertContinue('Continue?');
    };

    applyDiffs = async (userOptions: unknown, _: Conf) => {
        logger.debug('Prompt Diffs');

        const options = applyDiffsOptionSchema.parse(userOptions);
        const diffs = this.populateDiffs(options.diffs);
        const { files } = options;

        for (let i = 0, c = files.length; i < c; i++) {
            const file = files[i];
            const path = getAbsolutePath(file);
            const baseObject = YAML.parse(fs.readFileSync(path, 'utf8'));
            const paths = Object.keys(getObjectPaths(diffs?.deleted));
            const deletedDiffs = omit(baseObject, paths);
            const addedDiffs = merge(deletedDiffs, diffs?.added);
            const updatedDiffs = merge(addedDiffs, diffs?.updated);
            const newFile = YAML.stringify(updatedDiffs, null, 4);

            fs.writeFileSync(path, newFile, { encoding: 'utf-8' });
        }
    };

    fetchLastTag = async (userOptions: unknown, conf: Conf) => {
        logger.debug('Getting last tag');
        const options = fetchLastTagOptionSchema.parse(userOptions);
        options.project = this.populateVariable(options.project);
        const { store } = options;
        const fetchOptions = conf.getApiOptions(options);
        const tag = await Tags.fetchLast(fetchOptions);
        logger.info(`Last tag is ${tag}`);
        this.addToStore(store, tag);
    };

    readCurrentVersion = async (userOptions: unknown, _: Conf) => {
        logger.debug('Getting current version');
        const options = readCurrentVersionOptionSchema.parse(userOptions);
        const { file, store } = options;
        assertPathExists(file);
        const data = await Conf.getLinkedFile(file);
        const version = packageSchema.parse(data).version;
        logger.info(`Current version is ${version}`);
        this.addToStore(store, version);
    };

    createTag = async (userOptions: unknown, conf: Conf) => {
        logger.debug('Creating a new tag on the remote');
        const options = createTagOptionSchema.parse(userOptions);

        options.project = this.populateVariable(options.project);
        options.tagName = this.populateVariable(options.tagName);
        options.targetBranch = this.populateVariable(options.targetBranch);

        const { awaitPipeline } = options;
        const apiOptions = conf.getApiOptions(options);
        const postTagData = {
            ...apiOptions,
            ref: options.targetBranch,
            tagName: options.tagName,
        };
        await Tags.post(postTagData, logger);
        if (awaitPipeline) {
            const awaitPipelineParams = {
                options,
                conf,
                ref: options.tagName,
                source: 'push',
            };
            await Runner.awaitPipeline(awaitPipelineParams);
        }
    };

    writeVersion = async (userOptions: unknown, _: Conf) => {
        logger.debug('Setting new version');
        const options = writeVersionOptionSchema.parse(userOptions);
        options.newVersion = this.populateVariable(options.newVersion);
        const { files, newVersion } = options;
        files.forEach((file) => assertPathExists(file));
        files.forEach((file) => {
            writeVersion(file, newVersion);
            logger.debug(`Setting version to ${newVersion} in ${file}`);
        });
    };

    incrementVersion = async (userOptions: unknown, _: Conf) => {
        logger.debug(`Incrementing version`);

        const options = incrementVersionOptionSchema.parse(userOptions);
        options.incrementBy = this.populateVariable(options.incrementBy);
        options.incrementFrom = this.populateVariable(options.incrementFrom);
        const { incrementBy, incrementFrom, store } = options;
        assertVersionIncrement(incrementBy);
        const incrementedVersion = Tags.incrementVersion({
            incrementBy,
            version: incrementFrom,
        });
        logger.info(`Incremented version is ${incrementedVersion}`);
        this.addToStore(store, incrementedVersion);
    };

    commit = async (userOptions: unknown, _: Conf) => {
        const branchName = await Git.getBranchName();
        logger.info(`Committing changes in branch ${branchName}`);
        const options = commitOptionSchema.parse(userOptions);
        await Git.commit(options, logger);
        logger.debug(`Changes have been committed`);
    };

    pull = async (userOptions: unknown, _: Conf) => {
        const currentBranchName = await Git.getBranchName();
        logger.debug(`Pulling changes`);
        const options = pullOptionSchema.parse(userOptions);
        const { branch } = options;
        if (branch) {
            logger.info(
                `Pulling changes from origin ${branch} to ${currentBranchName}`
            );
        }
        await Git.pull(branch);
        logger.debug(`Pulling successful`);
    };

    push = async (userOptions: unknown, conf: Conf) => {
        const currentBranchName = await Git.getBranchName();
        const project = await Git.getProjectName();
        logger.debug(`Pushing changes`);
        const options = pushOptionSchema.parse(userOptions);

        if (options.branch) {
            options.branch = this.populateVariable(options.branch);
            logger.info(`Pushing changes from ${options.branch} to origin`);
        }

        const { branch, awaitPipeline } = options;
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

    startPipeline = async (userOptions: unknown, conf: Conf) => {
        // TODO: start pipeline possible await pipeline
        logger.debug('Creating a new tag on the remote');
        const options = createTagOptionSchema.parse(userOptions);

        options.project = this.populateVariable(options.project);
        options.tagName = this.populateVariable(options.tagName);
        options.targetBranch = this.populateVariable(options.targetBranch);

        const pipelines = new Pipelines(conf);
        // pipelines.post()
        const { awaitPipeline } = options;
        const apiOptions = conf.getApiOptions(options);
        const postTagData = {
            ...apiOptions,
            ref: options.targetBranch,
            tagName: options.tagName,
        };
        await Tags.post(postTagData, logger);
        if (awaitPipeline) {
            const awaitPipelineParams = {
                options,
                conf,
                ref: options.tagName,
                source: 'push',
            };
            await Runner.awaitPipeline(awaitPipelineParams);
        }
    };

    startJob = (options: unknown, _: Conf) => {
        // TODO: start a job
    };

    static awaitMergeAvailable = async (
        options: awaitMergeAvailableOptions,
        conf: Conf
    ) => {
        const awaitPipelineParams = {
            options,
            conf,
            source: 'push',
            ref: options.sourceBranch,
        };
        await Runner.awaitPipeline(awaitPipelineParams);
        awaitPipelineParams.source = 'merge_request_event';
        await Runner.awaitPipeline(awaitPipelineParams);
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

    addToStore = (userKey: string, value: string) => {
        const key = userKey.replace('$_', '');
        this.store[key] = value;
        logger.debug(`Storing ${value} as ${key}`);
    };

    addToDiffStore = (userKey: string, value: diffType) => {
        const key = userKey.replace('$_', '');
        this.diffStore[key] = value;
        logger.debug(`Storing diffs as ${key}`);
    };

    populateVariable = (store: string): string => {
        if (!checkIsVarKey(store)) return store;
        const varKey = store.match(/\$\_\w*/);
        if (!varKey || varKey?.length === 0) return store;
        const key = varKey[0].replace('$_', '');
        assertExists(this.store[key]);
        return this.store[key];
    };

    populateDiffs = (store: string): diffType | undefined => {
        if (!checkIsVarKey(store)) return;
        const varKey = store.match(/\$\_\w*/);
        if (!varKey || varKey?.length === 0) return;
        const key = varKey[0].replace('$_', '');
        assertExists(this.diffStore[key], `${store} does not exist`);
        return this.diffStore[key];
    };
}
export default Runner;

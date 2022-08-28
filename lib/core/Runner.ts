/* eslint-disable class-methods-use-this */
import prompt = require('prompt');
import fs = require('fs');
import omit = require('lodash.omit');
import merge = require('lodash.merge');
import { detailedDiff } from 'deep-object-diff';
import { z } from 'zod';
import YAML from 'yaml';
import ErrorHandler from './Errors/ErrorHandler';
import Git from './Git';
import Conf from './Conf';

import assertExists from '../utils/assertExists';
// import lang from './lang/en';
import Logger from './Logger';
import Tags from './Gitlab/Tags';
import {
  assertFileExists, getAbsolutePath, safeWriteFileSync, writeVersion,
} from '../utils/files';
import poll from '../utils/polling';
import standby from '../utils/standby';
import Users from './Gitlab/Users';
import Pipelines from './Gitlab/Pipelines';
import MergeRequests from './Gitlab/MergeRequests';
import assertContinue from '../utils/assertContinue';
import ERROR_MESSAGES from '../constants/ErrorMessages';
import getObjectPaths from '../utils/flattenObject';
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
  startPipelineOptionSchema,
  startJobOptionSchema,
  storeValidationSchema,
  CommandOptions,
} from '../models/config';
import { packageSchema, versionIncrementSchema } from '../models/others';
import { CLIArgs } from '../models/args';
import Jobs from './Gitlab/Jobs';
import snakeToCamelCase from '../utils/snakeToCamelCase';
import {
  ciToolkit,
  applyEnvDiffs,
  createMergeRequest,
  mergeMergeRequest,
  startPipeline,
  incrementVersionFromTag,
} from '../templates';
import { YAMLParse } from '../utils/parsers';

type KeysOfUnion<T> = T extends T ? keyof T : never;
type AwaitPipelineParams = {
  conf: Conf;
  options: Partial<GitlabApiOptions>;
  source?: string;
  ref?: string;
};
type AwaitJobParams = {
  conf: Conf;
  options: Partial<GitlabApiOptions>;
  id: number;
};
interface AwaitMergeAvailableOptions extends GitlabApiOptions {
  sourceBranch: string;
}

const logger = new Logger();
class Runner {
  store: Map<string, string>;

  diffStore: Map<string, DiffType>;

  constructor() {
    this.store = new Map();
    this.diffStore = new Map();
  }

  static init = async () => {
    fs.mkdirSync('./.ci-toolkit/.secrets', { recursive: true });
    await safeWriteFileSync('./ci-toolkit.yml', YAML.stringify(ciToolkit));
    await safeWriteFileSync('./.ci-toolkit/apply_env_diffs.yml', YAML.stringify(applyEnvDiffs));
    await safeWriteFileSync('./.ci-toolkit/create_merge_request.yml', YAML.stringify(createMergeRequest));
    await safeWriteFileSync('./.ci-toolkit/increment_version_from_tag.yml', YAML.stringify(incrementVersionFromTag));
    await safeWriteFileSync('./.ci-toolkit/merge_merge_request.yml', YAML.stringify(mergeMergeRequest));
    await safeWriteFileSync('./.ci-toolkit/start_pipeline.yml', YAML.stringify(startPipeline));
    await safeWriteFileSync('./.ci-toolkit/.secrets/token.txt', '');
  };

  static start = async (args: CLIArgs) => {
    const { run: command, config } = args;
    await ErrorHandler.try(async () => {
      const conf = await Runner.getConf(config);
      await Runner.runCustomCommand(command, conf);
    });
  };

  static runCustomCommand = async (customCommandKey: string, conf: Conf) => {
    const commands = conf.commands.get(customCommandKey);
    if (typeof commands === 'undefined') throw new Error(`${customCommandKey} does not seem to exist in your commands`);
    const runner = new Runner();

    for (let i = 0; i < commands.length; i += 1) {
      const command = commands[i];
      const commandName = Object.keys(command)[0] as KeysOfUnion<CommandOptions>;
      const commandOptions = Object.entries(command)[0][1] as unknown;
      const camelCaseCommandName = snakeToCamelCase(commandName);
      // eslint-disable-next-line no-await-in-loop
      await runner[camelCaseCommandName](commandOptions, conf);
      // eslint-disable-next-line no-await-in-loop
      await standby(1000);
    }
  };

  static getConf = async (path:string) => {
    logger.debug('getting config file');
    const configFile = Conf.readConfigFile(path);
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
    const postOptions: MergeRequestsPostOptions = {
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

    const { reviewers } = options;
    const reviewerIds = await Users.fetchIds({
      ...apiOptions,
      usernames: reviewers,
    }, logger);
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
    const mergeRequest = await MergeRequests.fetchRequest(mergeOptions, logger);
    MergeRequests.verify(options, mergeRequest);
    if (mergeRequest.merge_status !== 'can_be_merged') {
      logger.info(
        'merge request cannot be merged at the moment, checking if pipelines are running for merge request.',
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

  prompt = async (userOptions: unknown) => {
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

  getCurrentBranchName = async (userOptions: unknown) => {
    logger.debug('Getting current branch name');
    const options = getCurrentBranchNameOptionSchema.parse(userOptions);
    const { store } = options;
    const branchName = await Git.getBranchName(logger);
    logger.info(`Current branch name is ${branchName}`);
    this.addToStore(store, branchName);
  };

  getCurrentProjectName = async (userOptions: unknown) => {
    logger.debug('Getting current project name');
    const options = getCurrentProjectNameOptionSchema.parse(userOptions);
    const { store } = options;
    const projectName = await Git.getProjectName(logger);
    logger.info(`Current project name is ${projectName}`);
    this.addToStore(store, projectName);
  };

  getDiffs = async (userOptions: unknown) => {
    logger.debug('Getting Diffs');
    const options = getDiffsOptionSchema.parse(userOptions);
    options.sourceBranch = this.populateVariable(options.sourceBranch);
    options.targetBranch = this.populateVariable(options.targetBranch);
    const { store, sourceBranch, targetBranch } = options;
    const sourceFile = await Git.show(logger, sourceBranch, options.file);
    const sourceObj = YAMLParse(sourceFile);
    const targetFile = await Git.show(logger, targetBranch, options.file);
    const targetObj = YAMLParse(targetFile);
    const diffs = detailedDiff(sourceObj, targetObj) as DiffType;
    this.addToDiffStore(store, diffs);
  };

  promptDiffs = async (userOptions: unknown) => {
    logger.debug('Prompt Diffs');
    const options = promptDiffsOptionSchema.parse(userOptions);
    const { store } = options;
    const diffs = this.populateDiffs(options.diffs);
    const add = getObjectPaths(diffs?.added);
    const remove = getObjectPaths(diffs?.deleted);
    const update = getObjectPaths(diffs?.updated);
    logger.diffs({ add, remove, update });
    // TODO: store verified diffs and add modification
    await assertContinue('Continue?');
    if (typeof diffs !== 'undefined') {
      this.addToDiffStore(store, diffs);
    }
  };

  applyDiffs = async (userOptions: unknown) => {
    logger.debug('Prompt Diffs');

    const options = applyDiffsOptionSchema.parse(userOptions);
    const diffs = this.populateDiffs(options.diffs);
    const { files } = options;

    files.forEach((file) => {
      const path = getAbsolutePath(file);
      const baseObject = YAMLParse(fs.readFileSync(path, 'utf8'));
      const paths = Object.keys(getObjectPaths(diffs?.deleted));
      const deletedDiffs = omit(baseObject, paths);
      const addedDiffs = merge(deletedDiffs, diffs?.added);
      const updatedDiffs = merge(addedDiffs, diffs?.updated);
      const newFile = YAML.stringify(updatedDiffs, null, 4);
      fs.writeFileSync(path, newFile, { encoding: 'utf-8' });
    });
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

  readCurrentVersion = async (userOptions: unknown) => {
    logger.debug('Getting current version');
    const options = readCurrentVersionOptionSchema.parse(userOptions);
    const { file, store } = options;
    assertFileExists(file);
    const data = Conf.readConfigFile(file);
    const { version } = packageSchema.parse(data);
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

  writeVersion = async (userOptions: unknown) => {
    logger.debug('Setting new version');
    const options = writeVersionOptionSchema.parse(userOptions);
    options.newVersion = this.populateVariable(options.newVersion);
    const { files, newVersion } = options;
    files.forEach((file) => assertFileExists(file));
    files.forEach((file) => {
      writeVersion(file, newVersion);
      logger.debug(`Setting version to ${newVersion} in ${file}`);
    });
  };

  incrementVersion = async (userOptions: unknown) => {
    logger.debug('Incrementing version');

    const options = incrementVersionOptionSchema.parse(userOptions);
    options.incrementBy = this.populateVariable(options.incrementBy);
    options.incrementFrom = this.populateVariable(options.incrementFrom);
    const { incrementBy, incrementFrom, store } = options;
    const parsedIncrement = versionIncrementSchema.parse(incrementBy);
    const incrementedVersion = Tags.incrementVersion({
      incrementBy: parsedIncrement,
      version: incrementFrom,
    });
    logger.info(`Incremented version is ${incrementedVersion}`);
    this.addToStore(store, incrementedVersion);
  };

  commit = async (userOptions: unknown) => {
    const branchName = await Git.getBranchName(logger);
    logger.info(`Committing changes in branch ${branchName}`);
    const options = commitOptionSchema.parse(userOptions);
    await Git.commit(options, logger);
    logger.debug('Changes have been committed');
  };

  pull = async (userOptions: unknown) => {
    const currentBranchName = await Git.getBranchName(logger);
    logger.debug('Pulling changes');
    const options = pullOptionSchema.parse(userOptions);
    const { branch } = options;
    if (branch) {
      logger.info(`Pulling changes from origin ${branch} to ${currentBranchName}`);
    }
    await Git.pull(logger, branch);
    logger.debug('Pulling successful');
  };

  push = async (userOptions: unknown, conf: Conf) => {
    const currentBranchName = await Git.getBranchName(logger);
    const project = await Git.getProjectName(logger);
    logger.debug('Pushing changes');
    const options = pushOptionSchema.parse(userOptions);

    if (options.branch) {
      options.branch = this.populateVariable(options.branch);
      logger.info(`Pushing changes from ${options.branch} to origin`);
    }

    const { branch, awaitPipeline } = options;
    await Git.push(logger, branch);
    logger.debug('Push successful');

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
    logger.debug('Starting pipeline');
    const options = startPipelineOptionSchema.parse(userOptions);

    options.project = this.populateVariable(options.project);
    options.ref = this.populateVariable(options.ref);

    const pipelines = new Pipelines(conf);
    const {
      awaitPipeline, ref, project, store,
    } = options;
    const apiOptions = conf.getApiOptions(options);
    const pipelineData = {
      ...apiOptions,
      ref,
      project,
    };

    const data = await pipelines.post(pipelineData);

    if (store) {
      this.addToStore(store, data.id.toString());
    }

    if (awaitPipeline) {
      const awaitPipelineParams = {
        options,
        conf,
        ref,
        source: 'api',
      };
      await Runner.awaitPipeline(awaitPipelineParams);
    }
  };

  startJob = async (userOptions: unknown, conf: Conf) => {
    logger.debug('Starting job');
    const options = startJobOptionSchema.parse(userOptions);

    options.project = this.populateVariable(options.project);
    options.pipeline = this.populateVariable(options.pipeline);
    options.name = this.populateVariable(options.name);

    const { project, store, awaitJob } = options;
    const pipelines = new Pipelines(conf);
    const apiOptions = conf.getApiOptions(options);
    const pipelineData = {
      ...apiOptions,
      id: parseInt(options.pipeline, 10),
      project,
    };

    const data = await pipelines.fetchJobs(pipelineData);
    const foundJob = data.find((job) => job.name === options.name);

    assertExists(foundJob, `Could not find job named "${options.name}" in pipeline ${pipelineData.id}`);
    const jobId = foundJob.id;
    const jobs = new Jobs(conf);
    const startJobsOptions = {
      ...apiOptions,
      jobId,
      project,
    };
    const startedJob = await jobs.start(startJobsOptions);
    if (store) {
      this.addToStore(store, startedJob.id.toString());
    }
    if (awaitJob) {
      const awaitJobParam = {
        conf,
        options,
        id: jobId,
      };
      await Runner.awaitJob(awaitJobParam);
    }
  };

  static awaitMergeAvailable = async (options: AwaitMergeAvailableOptions, conf: Conf) => {
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

  static awaitPipeline = async (params: AwaitPipelineParams) => {
    await standby(5000);
    const {
      options, conf, source, ref,
    } = params;
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
      fn: async () => pipelines.arePipelineRunning(fetchOptions),
      timeoutMessage: 'timeout exceeded',
      pollingLogFn: () => {
        logger.debug('polling pipelines');
      },
    };
    await poll(pollingData);
    const failedPipelines = pipelines.getFailedPipelines();
    if (failedPipelines.length > 0) throw new Error('Failed pipelines');
  };

  static awaitJob = async (params: AwaitJobParams) => {
    await standby(5000);
    const {
      options, conf, id,
    } = params;
    const fetchOptions = conf.getApiOptions(options);
    const jobs = new Jobs(conf);
    const fetchAllOptions = {
      id,
      ...fetchOptions,
    };
    const job = await jobs.fetch(fetchAllOptions);

    if (job.status === 'success') return;

    jobs.pushRunningJob(job.id);
    const pollingData = {
      fn: async () => jobs.areJobsRunning(fetchOptions),
      timeoutMessage: 'timeout exceeded',
      pollingLogFn: () => {
        logger.debug('polling job');
      },
    };
    await poll(pollingData);
    const failedJobs = jobs.getFailedJobs();
    if (failedJobs.length > 0) throw new Error('Failed jobs');
  };

  addToStore = (userKey: string, value: string) => {
    const key = userKey.replace('$_', '');
    this.store.set(key, value);
    logger.debug(`Storing ${value} as ${key}`);
  };

  addToDiffStore = (userKey: string, value: DiffType) => {
    const key = userKey.replace('$_', '');
    this.diffStore.set(key, value);
    logger.debug(`Storing diffs as ${key}`);
  };

  populateVariable = (store: string): string => {
    if (!storeValidationSchema.safeParse(store).success) return store;
    const varKey = store.match(/\$_\w*/);
    if (!varKey || varKey?.length === 0) return store;
    const key = varKey[0].replace('$_', '');
    const value = this.store.get(key);
    return z.string({ required_error: `Could not find store variable : ${store}` }).parse(value);
  };

  populateDiffs = (store: string): DiffType | undefined => {
    if (!storeValidationSchema.safeParse(store).success) return undefined;
    const varKey = store.match(/\$_\w*/);
    if (!varKey || varKey?.length === 0) return undefined;
    const key = varKey[0].replace('$_', '');
    return this.diffStore.get(key);
  };
}
export default Runner;

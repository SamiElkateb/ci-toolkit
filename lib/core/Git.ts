import {
	assertArray,
	assertString,
} from '../utils/assertions/baseTypeAssertions';
import { execCommand } from '../utils/commands';
import Conf from './Conf';
import Logger from './Logger';

type commitOptions = {
	message?: string;
	add?: string;
};
class Git {
	private conf: Conf;
	private logger: Logger;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Logger(conf.logLevel);
	}

	static getBranchName = async (path?: string) => {
		const command = 'git rev-parse --abbrev-ref HEAD';
		const data = await execCommand({ command, path });
		const branchName = data.replace('\n', '');
		assertString(branchName, 'Could not find branch name');
		return branchName;
	};

	static getProjectName = async (path?: string) => {
		const command = 'git remote -v';
		const data = await execCommand({ command, path });
		const [fetch, push] = data.split('\n');

		const fetchUrl = Git.getUrlFromGitRemote(fetch);
		const pushUrl = Git.getUrlFromGitRemote(push);

		const fetchProjectName = Git.getProjectNameFromUrl(fetchUrl);
		const pushProjectName = Git.getProjectNameFromUrl(pushUrl);

		if (fetchProjectName === pushProjectName) return pushProjectName;
		throw 'Fetch and push origin do not match. Could not deduce project name.';
	};

	static commit = async (options: commitOptions, logger?: Logger) => {
		const { message, add } = options;
		const canCommit = await Git.checkCanCommit(logger);
		if (!canCommit) return;
		let command = 'git commit';
		if (add === 'all') {
			command = 'git add . && git commit';
		} else if (add === 'tracked') {
			command = 'git commit -a';
		} else if (typeof add !== 'undefined') {
			throw 'when committing authorized "add" values are "all" to stage all files and "tracked" to stage only tracked files';
		}
		command = message ? `${command} -m` : command;
		await execCommand({ command, message });
	};

	static pull = async (branch?: string) => {
		const command = branch ? 'git pull origin' : 'git pull';
		await execCommand({ command, branch });
	};

	static getOriginDomain = async (path?: string) => {
		const command = 'git remote -v';
		const data = await execCommand({ command, path });
		const [fetch, push] = data.split('\n');

		const fetchUrl = Git.getUrlFromGitRemote(fetch);
		const pushUrl = Git.getUrlFromGitRemote(push);

		const fetchOriginDomain = Git.getOriginDomainFromUrl(fetchUrl);
		const pushOriginDomain = Git.getOriginDomainFromUrl(pushUrl);

		if (fetchOriginDomain === pushOriginDomain) return pushOriginDomain;
		throw 'Fetch and push origin do not match. Could not deduce domain name.';
	};

	static getUrlFromGitRemote = (remote: unknown) => {
		assertString(remote);
		const urlArray = remote.match(/^origin\t(.*) \((fetch|push)\)$/);
		assertArray(urlArray);
		return urlArray[1];
	};

	static getProjectNameFromUrl = (url: unknown) => {
		assertString(url);
		const projectNameArray = url.match(/^.*:(.*)\.git$/);
		assertArray(projectNameArray);
		return projectNameArray[1];
	};

	static getOriginDomainFromUrl = (url: unknown) => {
		assertString(url);
		const originDomainArray = url.match(/^git@(.*):.*\.git$/);
		assertArray(originDomainArray);
		return originDomainArray[1];
	};

	static checkCanCommit = async (logger?: Logger) => {
		const command = 'git status';
		const response = await execCommand({ command });
		const cleanTreeMessage = 'nothing to commit, working tree clean';
		const noStagedChangesMessage = 'no changes added to commit';
		const changesToCommitMessage = 'Changes to be committed';
		const changesNotCommittedMessage = 'Changes not staged for commit';
		if (response.includes(cleanTreeMessage)) {
			if (logger) {
				const text = logger.text.shouldCommitTreeClean();
				const continueText = logger.text.continueNoCommit();
				await logger.warn(text, continueText);
			}
			// logger.warn('commit skipped');
			// await standby(1000);
			return false;
		}
		if (response.includes(noStagedChangesMessage)) {
			// await standby(60000);
			if (logger) {
				const text = logger.text.shouldCommitNoChangeAdded();
				const continueText = logger.text.continueNoCommit();
				await logger.warn(text, continueText);
			}
			return false;
		}
		if (
			response.includes(changesNotCommittedMessage) &&
			response.includes(changesToCommitMessage)
		) {
			if (logger) {
				const text = logger.text.shouldCommitSomeChangeNotAdded();
				const continueText = logger.text.continueCommitStaged();
				await logger.warn(text, continueText);
			}
			return true;
		}
		if (response.includes(changesToCommitMessage)) {
			return true;
		}
		throw 'could not get git status';
	};
}

export default Git;

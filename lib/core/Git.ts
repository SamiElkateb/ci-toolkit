import { assertPathExists, assertString } from '../utils/assertions';
import { checkIsString } from '../utils/validation';

const util = require('util');
const { exec } = require('child_process');
const execProm = util.promisify(exec);

class Git {
	constructor() {}

	static getBranchName = async (path?: string) => {
		if (path) assertPathExists(path);
		const baseCommand = 'git rev-parse --abbrev-ref HEAD';
		const command = path ? `cd ${path} && ${baseCommand}` : baseCommand;
		const data = await execProm(command);
		const branchName = data.stdout.replace('\n', '');
		assertString(branchName, 'Could not find branch name');
		return branchName;
	};

	static getProjectName = async (path?: string) => {
		if (path) assertPathExists(path);
		const baseCommand = 'git remote -v';
		const command = path ? `cd ${path} && ${baseCommand}` : baseCommand;
		const data = await execProm(command);
		const [fetch, push] = data.stdout.split('\n');

		assertString(fetch, 'Could not get Project Name');
		assertString(push, 'Could not get Project Name');
		const fetchUrl = Git.getUrlFromGitRemote(fetch);
		const pushUrl = Git.getUrlFromGitRemote(push);

		assertString(fetchUrl, 'Could not get Project Name');
		assertString(pushUrl, 'Could not get Project Name');
		const fetchProjectName = Git.getProjectNameFromUrl(fetchUrl);
		const pushProjectName = Git.getProjectNameFromUrl(pushUrl);

		assertString(fetchProjectName, 'Could not get Project Name');
		assertString(pushProjectName, 'Could not get Project Name');
		if (fetchProjectName === pushProjectName) return pushProjectName;
		throw 'Fetch and push origin do not match. Could not deduce project name.';
	};

	static getOriginDomain = async (path?: string) => {
		if (path) assertPathExists(path);
		const baseCommand = 'git remote -v';
		const command = path ? `cd ${path} && ${baseCommand}` : baseCommand;
		const data = await execProm(command);
		const [fetch, push] = data.stdout.split('\n');
		const fetchUrl = fetch.match(/^origin\t(.*) \(fetch\)$/)[1];
		const pushUrl = push.match(/^origin\t(.*) \(push\)$/)[1];
		const fetchOriginDomain = fetchUrl.match(/^git@(.*):.*\.git$/)[1];
		const pushOriginDomain = pushUrl.match(/^git@(.*):.*\.git$/)[1];
		if (fetchOriginDomain === pushOriginDomain) return pushOriginDomain;
		throw 'Fetch and push origin do not match. Could not deduce domain name.';
	};

	static getUrlFromGitRemote = (remote: unknown) => {
		if (!checkIsString(remote)) return;
		const urlArray = remote.match(/^origin\t(.*) \((fetch|push)\)$/);
		if (urlArray === null) return;
		return urlArray[1];
	};

	static getProjectNameFromUrl = (url: unknown) => {
		if (!checkIsString(url)) return;
		const projectNameArray = url.match(/^.*:(.*)\.git$/);
		if (projectNameArray === null) return;
		return projectNameArray[1];
	};
}

export default Git;

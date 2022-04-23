import { checkIsString } from '../utils';

const util = require('util');
const { exec } = require('child_process');
const execProm = util.promisify(exec);

class Git {
	constructor() {}
	static getCurrentBranchName = async () => {
		const data = await execProm('git rev-parse --abbrev-ref HEAD');
		const branchName = data.stdout.replace('\n', '');
		return branchName;
	};
	static getCurrentProjectName = async () => {
		const data = await execProm('git remote -v');
		const [fetch, push] = data.stdout.split('\n');
		if (!checkIsString(fetch) || !checkIsString(push))
			throw 'Could not get Project Name 1';
		const fetchUrl = Git.getUrlFromGitRemote(fetch);
		const pushUrl = Git.getUrlFromGitRemote(push);
		if (!checkIsString(fetchUrl) || !checkIsString(pushUrl))
			throw 'Could not get Project Name 2';

		const fetchProjectName = Git.getProjectNameFromUrl(fetchUrl);
		const pushProjectName = Git.getProjectNameFromUrl(pushUrl);
		if (!checkIsString(fetchProjectName) || !checkIsString(pushProjectName))
			throw 'Could not get Project Name 3';

		if (fetchProjectName === pushProjectName) return pushProjectName;
		throw 'Fetch and push origin do not match. Could not deduce project name.';
	};
	static getOriginDomain = async () => {
		const data = await execProm('git remote -v');
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

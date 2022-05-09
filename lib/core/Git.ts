import { assertString } from '../utils/assertions/baseTypeAssertions';
import { execCommand } from '../utils/commands';
import { checkIsString } from '../utils/validations/basicTypeValidations';

class Git {
	constructor() {}

	static getBranchName = async (path?: string) => {
		const command = 'git rev-parse --abbrev-ref HEAD';
		const data = await execCommand({ command, path });
		const branchName = data.stdout.replace('\n', '');
		assertString(branchName, 'Could not find branch name');
		return branchName;
	};

	static getProjectName = async (path?: string) => {
		const command = 'git remote -v';
		const data = await execCommand({ command, path });
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

	static commit = async (message?: string) => {
		const command = message ? 'git commit -m' : 'git commit';
		await execCommand({ command, message });
	};

	static getOriginDomain = async (path?: string) => {
		const command = 'git remote -v';
		const data = await execCommand({ command, path });
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

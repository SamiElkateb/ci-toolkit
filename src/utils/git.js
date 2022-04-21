const util = require('util');
const { exec } = require('child_process');
const execProm = util.promisify(exec);
const getCurrentBranchName = async () => {
	const data = await execProm('git rev-parse --abbrev-ref HEAD');
	return data.stdout;
};

const getCurrentProjectName = async () => {
	const data = await execProm('git remote -v');
	const [fetch, push] = data.stdout.split('\n');
	const fetchUrl = fetch.match(/^origin\t(.*) \(fetch\)$/)[1];
	const pushUrl = push.match(/^origin\t(.*) \(push\)$/)[1];
	const fetchProjectName = fetchUrl.match(/^.*:(.*)\.git$/)[1];
	const pushProjectName = pushUrl.match(/^.*:(.*)\.git$/)[1];
	if (fetchProjectName === pushProjectName) return pushProjectName;
	throw 'Fetch and push origin do not match. Could not deduce project name.';
};

const getOriginDomain = async () => {
	const data = await execProm('git remote -v');
	const [fetch, push] = data.stdout.split('\n');
	const fetchUrl = fetch.match(/^origin\t(.*) \(fetch\)$/)[1];
	const pushUrl = push.match(/^origin\t(.*) \(push\)$/)[1];
	const fetchOriginDomain = fetchUrl.match(/^git@(.*):.*\.git$/)[1];
	const pushOriginDomain = pushUrl.match(/^git@(.*):.*\.git$/)[1];
	if (fetchOriginDomain === pushOriginDomain) return pushOriginDomain;
	throw 'Fetch and push origin do not match. Could not deduce domain name.';
};

module.exports = {
	getCurrentBranchName,
	getCurrentProjectName,
	getOriginDomain,
};

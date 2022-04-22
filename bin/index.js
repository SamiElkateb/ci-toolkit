#! /usr/bin/env node
const {
	increaseTag,
	Gitlab,
	Git,
	getConfig,
	log,
	errorBoundary,
} = require('../lib');
const deploy = async () => {
	const customConfig = getConfig();
	if (!customConfig) throw 'No config file was found';
	const conf = await Gitlab.parseConfig(customConfig);
	const gitlab = new Gitlab(conf);
	const branchName = await Git.getCurrentBranchName();

	const tags = await gitlab.getTags();
	console.log(tags);
};

errorBoundary(deploy);

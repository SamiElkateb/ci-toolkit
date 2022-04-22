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
	const config = getConfig();
	if (config) throw 'No config file was found';
	const gitlab = new Gitlab();
	const git = new Git();
	const branchName = await git.getCurrentBranchName();
	console.log('hi', branchName);
};

errorBoundary(deploy);

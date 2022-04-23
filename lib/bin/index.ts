#! /usr/bin/env node
import { Gitlab, Git, getConfig, errorBoundary } from '../index';
const deploy = async () => {
	const customConfig = getConfig();
	if (!customConfig) throw 'No config file was found';
	const conf = await Gitlab.parseConfig(customConfig);
	const gitlab = new Gitlab(conf);
	const branchName = await Git.getCurrentBranchName();
	//console.log(branchName);
	const mergeRequest = await gitlab.mergeRequests.get(branchName);
	const tags = await gitlab.tags.getLast();
	console.log(tags);
};

errorBoundary(deploy);

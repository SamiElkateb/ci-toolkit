#! /usr/bin/env node

import Runner from '../core/Runner';

/* import { Git } from '../core';
import ErrorHandler from '../core/Errors/ErrorHandler';
import Conf from '../core/Gitlab/Conf';
import { Gitlab, getConfig } from '../index';
const deploy = async () => {
	console.log(process.argv);
	const configFile = getConfig();
	if (!configFile) throw 'No config file was found';
	const parsedConfig = await Conf.parseConfig(configFile);
	const conf = new Conf(parsedConfig);
	const gitlab = new Gitlab(conf);
	console.log('branchName');
	const branchName = await Git.getCurrentBranchName();
	console.log(branchName);
	//console.log(branchName);
	const mergeRequest = await gitlab.mergeRequests.get(branchName);
	gitlab.mergeRequests.verify(mergeRequest);
	await gitlab.mergeRequests.merge(mergeRequest);
	const tags = await gitlab.tags.getLast();
	console.log(tags);
};

ErrorHandler.try(deploy); */
Runner.start();

#! /usr/bin/env node
import { Git } from '../core';
import Conf from '../core/Gitlab/Conf';
import { Gitlab, getConfig, errorBoundary } from '../index';
const deploy = async () => {
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
	const tags = await gitlab.tags.getLast();
	console.log(tags);
};

errorBoundary(deploy);

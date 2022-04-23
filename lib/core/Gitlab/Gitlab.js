const axios = require('axios');
const https = require('https');
const Git = require('../Git');
const MergeRequests = require('./MergeRequests');
const Tags = require('./Tags');
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	constructor(conf) {
		this.mergeRequests = new MergeRequests(conf);
		this.tags = new Tags(conf);
	}
	static parseConfig = async (customConfig) => {
		const conf = { ...customConfig };
		conf.protocole = conf.protocole || 'https';

		const isDomainDefault = !conf.domain || conf.domain === 'default';
		if (isDomainDefault) conf.domain = await Git.getOriginDomain();

		const isProjectIdDefault =
			!conf.project_id || conf.project_id === 'default';
		if (isProjectIdDefault) {
			conf.project_id = await Git.getCurrentProjectName();
		}

		conf.project_id = encodeURIComponent(conf.project_id);
		conf.projectId = conf.project_id;
		conf.agent = agent;
		return conf;
	};
}
module.exports = Gitlab;

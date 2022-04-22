const axios = require('axios');
const https = require('https');
const Git = require('./Git');
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	constructor(conf) {
		this.domain = conf.domain;
		this.token = conf.token;
		this.protocole = conf.protocole || 'https';
		this.projectId = conf.project_id;
	}
	static parseConfig = async (customConfig) => {
		const conf = { ...customConfig };
		const isDomainDefault = !conf.domain || conf.domain === 'default';
		if (isDomainDefault) conf.domain = await Git.getOriginDomain();

		const isProjectIdDefault =
			!conf.project_id || conf.project_id === 'default';
		if (isProjectIdDefault) {
			conf.project_id = await Git.getCurrentProjectName();
		}

		conf.project_id = encodeURIComponent(conf.project_id);
		return conf;
	};

	getTags = async () => {
		const url = `${this.protocole}://${this.domain}/api/v4/projects/${this.projectId}/repository/tags?access_token=${this.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getLastTag = async () => {
		const data = await this.getTags();
		const lastTag = data[0].name;
		return lastTag;
	};
	getMergeRequests = async () => {
		const url = `${this.protocole}://${this.domain}/api/v4/projects/${this.projectId}/merge_requests?state=opened&access_token=${this.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getMergeRequest = async (sourceBranch) => {
		const mergeRequests = await this.getMergeRequests();
		const mergeRequest = mergeRequests.find(
			(mergeRequest) => mergeRequest.source_branch === sourceBranch
		);
		return mergeRequest;
	};
}
module.exports = Gitlab;

const axios = require('axios');
const https = require('https');
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	constructor(config) {
		this.domain = config.domain;
		this.token = config.token;
		this.protocole = config.protocole || 'https';
	}
	getTags = async (projectId) => {
		const encodedProjectId = encodeURIComponent(projectId);
		const url = `${this.protocole}://${this.domain}/api/v4/projects/${encodedProjectId}/repository/tags?access_token=${token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getLastTag = async (projectId) => {
		const data = await getTags(projectId);
		const lastTag = data[0].name;
		return lastTag;
	};
	getMergeRequests = async (projectId) => {
		const encodedProjectId = encodeURIComponent(projectId);
		const url = `${this.protocole}://${this.domain}/api/v4/projects/${encodedProjectId}/merge_requests?state=opened&access_token=${token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getMergeRequest = async ({ projectId, sourceBranch }) => {
		const mergeRequests = await getMergeRequests(projectId);
		const mergeRequest = mergeRequests.find(
			(mergeRequest) => mergeRequest.source_branch === sourceBranch
		);
		return mergeRequest;
	};
}
module.exports = Gitlab;

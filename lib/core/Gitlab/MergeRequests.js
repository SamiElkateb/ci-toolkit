const axios = require('axios');
class MergeRequests {
	constructor(conf) {
		this.conf = conf;
	}
	get = async (sourceBranch) => {
		if (sourceBranch) return await this.getRequest(sourceBranch);
		return await this.getRequests();
	};
	getRequests = async () => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?state=opened&access_token=${this.conf.token}`;
		console.log(url);
		const res = await axios.get(url, { httpsAgent: this.conf.agent });
		return res.data;
	};
	getRequest = async (sourceBranch) => {
		const mergeRequests = await this.getRequests();
		const mergeRequest = mergeRequests.find(
			(mergeRequest) => mergeRequest.source_branch === sourceBranch
		);
		return mergeRequest;
	};
	verify = async (mergeRequest) => {};
	merge = async (mergeRequest) => {
		const mergeRequestIid = mergeRequest.iid;
		const url = `${this.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/${mergeRequestIid}/merge?access_token=${this.conf.token}`;
		const res = await axios.put(url, { httpsAgent: this.conf.agent });
		return res.data;
	};
}
module.exports = MergeRequests;

import Conf from './Conf';
import https = require('https');
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
class MergeRequests {
	private conf: Conf;
	constructor(conf: Conf) {
		this.conf = conf;
	}
	get = async (sourceBranch: string) => {
		if (sourceBranch) return await this.getRequest(sourceBranch);
		return await this.getRequests();
	};
	getRequests = async () => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?state=opened&access_token=${this.conf.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getRequest = async (sourceBranch: string) => {
		const mergeRequests = await this.getRequests();
		const mergeRequest = mergeRequests.find(
			(mergeRequest: mergeRequest) =>
				mergeRequest.source_branch === sourceBranch
		);
		return mergeRequest;
	};
	verify = (mergeRequest: mergeRequest) => {
		if (mergeRequest.upvotes < this.conf.mergeRequirements.minUpvotes)
			throw "Merge request doesn't meet minimum upvotes";
		if (mergeRequest.downvotes >= this.conf.mergeRequirements.maxDownvotes)
			throw 'Merge request exceeds maximum downvotes';
		if (
			mergeRequest.target_branch !==
			this.conf.mergeRequirements.targetBranch
		)
			throw 'Merge request exceeds maximum downvotes';
	};
	merge = async (mergeRequest: mergeRequest) => {
		const mergeRequestIid = mergeRequest.iid;
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests/${mergeRequestIid}/merge?access_token=${this.conf.token}`;
		console.log(url);
		const res = await axios.put(url, {}, { httpsAgent: agent });
		return res.data;
	};
}
export default MergeRequests;

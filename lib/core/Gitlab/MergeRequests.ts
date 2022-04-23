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
		console.log(url);
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getRequest = async (sourceBranch: string) => {
		const mergeRequests = await this.getRequests();
		const mergeRequest = mergeRequests.find(
			(mergeRequest: any) => mergeRequest.source_branch === sourceBranch
		);
		return mergeRequest;
	};
	verify = async (mergeRequest: any) => {};
	merge = async (mergeRequest: any) => {
		const mergeRequestIid = mergeRequest.iid;
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/${mergeRequestIid}/merge?access_token=${this.conf.token}`;
		const res = await axios.put(url, { httpsAgent: agent });
		return res.data;
	};
}
export default MergeRequests;

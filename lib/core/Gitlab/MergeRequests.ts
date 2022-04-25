import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
import { assertExists } from '../../utils/assertions';
import lang from '../lang/en';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');

class MergeRequests {
	private conf: Conf;
	private logger: Log;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Log(conf.logLevel);
	}

	get<S extends string>(
		x?: S
	): S extends string ? Promise<mergeRequest> : Promise<mergeRequest[]>;

	async get(sourceBranch?: string): Promise<mergeRequest | mergeRequest[]> {
		if (sourceBranch) return await this.getRequest(sourceBranch);
		return await this.getRequests();
	}
	async post(sourceBranch: string): Promise<mergeRequest | mergeRequest[]> {
		const data = {
			source_branch: sourceBranch,
			target_branch: this.conf,
			title: '',
			assignee_id: '',
			reviewer_ids: '',
		};
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?state=opened&access_token=${this.conf.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	}
	getRequests = async (): Promise<mergeRequest[]> => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?state=opened&access_token=${this.conf.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getRequest = async (sourceBranch: string): Promise<mergeRequest> => {
		const mergeRequests = await this.getRequests();
		const mergeRequest = mergeRequests.find(
			(mergeRequest: mergeRequest) =>
				mergeRequest.source_branch === sourceBranch
		);
		assertExists(mergeRequest, lang.noMergeRequest(sourceBranch));
		return mergeRequest;
	};
	verify = (mergeRequest: mergeRequest) => {
		if (
			mergeRequest.upvotes <
			this.conf.mergeRequests.requirements.minUpvotes
		)
			throw "merge request doesn't meet minimum upvotes";
		if (
			mergeRequest.downvotes >=
			this.conf.mergeRequests.requirements.maxDownvotes
		)
			throw 'merge request exceeds maximum downvotes';
		if (mergeRequest.target_branch !== this.conf.mergeRequests.targetBranch)
			throw 'target branch error';
	};
	merge = async (mergeRequest: mergeRequest) => {
		const mergeRequestIid = mergeRequest.iid;
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests/${mergeRequestIid}/merge?access_token=${this.conf.token}`;
		const res = await axios.put(url, {}, { httpsAgent: agent });
		return res.data;
	};
}
export default MergeRequests;

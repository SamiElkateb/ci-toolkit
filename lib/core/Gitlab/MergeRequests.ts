// @ts-nocheck
import Conf from '../Conf';
import https = require('https');
import Logger from '../Logger';
import { assertExists } from '../../utils/assertions/baseTypeAssertions';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
type postParams = {
	sourceBranch: string;
	assigneeId?: number;
	reviewerIds: number[];
};

class MergeRequests {
	private conf: Conf;
	private logger: Logger;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Logger(conf.logLevel);
	}

	fetch<S extends string>(
		x?: S
	): S extends string ? Promise<mergeRequest> : Promise<mergeRequest[]>;

	async fetch(sourceBranch?: string): Promise<mergeRequest | mergeRequest[]> {
		if (sourceBranch) return await this.fetchRequest(sourceBranch);
		return await this.fetchRequests();
	}
	async post(params: postParams): Promise<mergeRequest | mergeRequest[]> {
		const { sourceBranch, assigneeId, reviewerIds } = params;
		const title = this.conf.mergeRequests.creation.title.replace(
			/\[branch_name\]/,
			params.sourceBranch
		);
		const data = {
			source_branch: sourceBranch,
			target_branch: this.conf.mergeRequests.targetBranch,
			title,
			assignee_id: assigneeId,
			reviewer_ids: reviewerIds,
		};
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?access_token=${this.conf.token}`;
		this.logger.request(url, 'post');
		try {
			const res = await axios.post(url, data, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	}
	fetchRequests = async (): Promise<mergeRequest[]> => {
		const mine = '&scope=assigned_to_me';
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests?state=opened&access_token=${this.conf.token}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	fetchRequest = async (sourceBranch: string): Promise<mergeRequest> => {
		const mergeRequests = await this.fetchRequests();
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
		const data = {
			squash: this.conf.mergeRequests.options.squashCommits,
			should_remove_source_branch:
				this.conf.mergeRequests.options.deleteSourceBranch,
		};
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/merge_requests/${mergeRequestIid}/merge?access_token=${this.conf.token}`;
		this.logger.request(url, 'put');
		try {
			const res = await axios.put(url, data, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
}
export default MergeRequests;

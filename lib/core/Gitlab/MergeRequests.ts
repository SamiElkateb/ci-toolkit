import Conf from '../Conf';
import Logger from '../Logger';
import { assertExists } from '../../utils/assertions/baseTypeAssertions';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
import { hasOwnProperty } from '../../utils/validations/basicTypeValidations';

const axios = require('axios');

interface verifyOptions {
	minUpvotes?: number;
	maxDownvotes?: number;
	targetBranch: string;
}

interface fetchOptions extends gitlabApiOptions {
	sourceBranch: string;
}
interface mergeOptions extends gitlabApiOptions {
	squashCommits?: boolean;
	deleteSourceBranch?: boolean;
}

class MergeRequests {
	private conf: Conf;
	private logger: Logger;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Logger(conf.logLevel);
	}

	static fetch<S extends fetchOptions | gitlabApiOptions>(
		options: S,
		logger?: Logger
	): S extends fetchOptions ? Promise<mergeRequest> : Promise<mergeRequest[]>;

	static async fetch(
		options: fetchOptions | gitlabApiOptions,
		logger?: Logger
	): Promise<mergeRequest | mergeRequest[]> {
		if (hasOwnProperty(options, 'sourceBranch')) {
			return await MergeRequests.fetchRequest(options, logger);
		}
		return await MergeRequests.fetchRequests(options, logger);
	}
	static async post(
		options: mergeRequestsPostOptions,
		logger?: Logger
	): Promise<mergeRequest | mergeRequest[]> {
		const {
			title,
			protocole,
			domain,
			project,
			token,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		// const title = this.conf.mergeRequests.creation.title.replace(
		// 	/\[branch_name\]/,
		// 	sourceBranch
		// );
		const data = {
			source_branch: options.sourceBranch,
			target_branch: options.targetBranch,
			title,
			assignee_id: options.assigneeId,
			reviewer_ids: options.reviewerIds,
			approvals_before_merge: options.minApprovals,
			remove_source_branch: options.deleteSourceBranch,
			squash: options.squashCommits,
			labels: options.label,
		};
		const url = `${protocole}://${domain}/api/v4/projects/${project}/merge_requests?access_token=${token}`;
		logger?.request(url, 'post');
		try {
			const res = await axios.post(url, data, axiosOptions);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	}
	static fetchRequests = async (
		options: gitlabApiOptions,
		logger?: Logger
	): Promise<mergeRequest[]> => {
		const {
			protocole,
			domain,
			project,
			token,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		// const mine = '&scope=assigned_to_me';
		const url = `${protocole}://${domain}/api/v4/projects/${project}/merge_requests?state=opened&access_token=${token}`;
		logger?.request(url, 'get');
		try {
			const res = await axios.get(url, axiosOptions);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	static fetchRequest = async (
		options: fetchOptions,
		logger?: Logger
	): Promise<mergeRequest> => {
		const mergeRequests = await MergeRequests.fetchRequests(
			options,
			logger
		);
		const mergeRequest = mergeRequests.find(
			(mergeRequest: mergeRequest) =>
				mergeRequest.source_branch === options.sourceBranch
		);
		assertExists(mergeRequest, lang.noMergeRequest(options.sourceBranch));
		return mergeRequest;
	};
	static verify = (options: verifyOptions, mergeRequest: mergeRequest) => {
		const { maxDownvotes = 0, minUpvotes = 0, targetBranch } = options;
		if (mergeRequest.has_conflicts) {
			throw 'Please resolve merge request conflicts before merging';
		}
		if (mergeRequest.blocking_discussions_resolved === false) {
			throw 'Please resolve active threads before merging';
		}
		if (mergeRequest.upvotes < minUpvotes) {
			throw "Merge request doesn't meet minimum upvotes";
		}
		if (mergeRequest.downvotes >= maxDownvotes) {
			throw 'Merge request exceeds maximum downvotes';
		}
		if (mergeRequest.target_branch !== targetBranch) {
			throw 'Target branch error';
		}
	};
	static merge = async (
		options: mergeOptions,
		mergeRequest: mergeRequest,
		logger?: Logger
	) => {
		const {
			protocole,
			domain,
			project,
			token,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		const mergeRequestIid = mergeRequest.iid;
		const data = {
			squash: options.squashCommits,
			should_remove_source_branch: options.deleteSourceBranch,
		};
		const url = `${protocole}://${domain}/api/v4/projects/${project}/merge_requests/${mergeRequestIid}/merge?access_token=${token}`;
		logger?.request(url, 'put');
		try {
			const res = await axios.put(url, data, axiosOptions);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
}
export default MergeRequests;

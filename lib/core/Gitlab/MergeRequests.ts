import axios from 'axios';
import { z, ZodError } from 'zod';
import Logger from '../Logger';
import assertExists from '../../utils/assertExists';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
import getHttpsAgent from '../../utils/getHttpsAgent';
import gitlabMergeRequestSchema, { GitlabMergeRequest } from '../../models/Gitlab/MergeRequests';

interface VerifyOptions {
  minUpvotes?: number;
  maxDownvotes?: number;
  targetBranch: string;
}

interface FetchOptions extends GitlabApiOptions {
  sourceBranch: string;
}
interface MergeOptions extends GitlabApiOptions {
  squashCommits?: boolean;
  deleteSourceBranch?: boolean;
}

class MergeRequests {
  static async post(
    options: MergeRequestsPostOptions,
    logger?: Logger,
  ) {
    const {
      title,
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
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
      const res = await axios.post<unknown>(url, data, axiosOptions);
      const parsedData = gitlabMergeRequestSchema.parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  }

  static fetchRequests = async (
    options: GitlabApiOptions,
    logger?: Logger,
  ) => {
    const {
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/merge_requests?state=opened&access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = z.array(gitlabMergeRequestSchema).parse(res.data);

      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  static fetchRequest = async (
    options: FetchOptions,
    logger?: Logger,
  ) => {
    const mergeRequests = await MergeRequests.fetchRequests(
      options,
      logger,
    );
    const foundMergeRequest = mergeRequests.find(
      (mergeRequest) => mergeRequest.source_branch === options.sourceBranch,
    );
    assertExists(foundMergeRequest, lang.noMergeRequest(options.sourceBranch));
    return foundMergeRequest;
  };

  static verify = (options: VerifyOptions, mergeRequest: GitlabMergeRequest) => {
    const { maxDownvotes = 0, minUpvotes = 0, targetBranch } = options;
    if (mergeRequest.has_conflicts) {
      throw new Error('Please resolve merge request conflicts before merging');
    }
    if (mergeRequest.blocking_discussions_resolved === false) {
      throw new Error('Please resolve active threads before merging');
    }
    if (mergeRequest.upvotes < minUpvotes) {
      throw new Error("Merge request doesn't meet minimum upvotes");
    }
    if (mergeRequest.downvotes > maxDownvotes) {
      throw new Error('Merge request exceeds maximum downvotes');
    }
    if (mergeRequest.target_branch !== targetBranch) {
      throw new Error('Target branch error');
    }
  };

  static merge = async (
    options: MergeOptions,
    mergeRequest: GitlabMergeRequest,
    logger?: Logger,
  ) => {
    const {
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
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
      const res = await axios.put<unknown>(url, data, axiosOptions);
      return res.data;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };
}
export default MergeRequests;

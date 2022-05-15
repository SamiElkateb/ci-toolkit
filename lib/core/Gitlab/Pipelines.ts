import Conf from '../Conf';
import Logger from '../Logger';
import GitlabApiError from '../Errors/GitlabApiError';
import { assertNumber } from '../../utils/assertions/baseTypeAssertions';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
type pollParams = {
	fn: () => unknown;
	validate: (value: unknown) => boolean;
	interval: number;
	timeout: number;
};
interface fetchOptions extends gitlabApiOptions {
	id: number;
}
interface fetchAllOptions extends gitlabApiOptions {
	username?: string;
	ref?: string;
	source?: string;
}
interface postOptions extends gitlabApiOptions {
	branch: string;
	variables?: pipelineVariable[];
}

const axios = require('axios');
class Pipelines {
	private runningPipelines: number[];
	private failedPipelines: number[];
	private successPipelines: number[];
	private canceledPipelines: number[];
	private logger: Logger;
	constructor(conf: Conf) {
		this.logger = new Logger(conf.logLevel);
		this.runningPipelines = [];
		this.failedPipelines = [];
		this.successPipelines = [];
		this.canceledPipelines = [];
	}
	fetch = async (options: fetchOptions): Promise<pipeline> => {
		const {
			id,
			protocole,
			domain,
			project,
			token,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		const url = `${protocole}://${domain}/api/v4/projects/${project}/pipelines/${id}?access_token=${token}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, axiosOptions);
			if (res.data.status === 'running') 'd';
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	fetchAll = async (options: fetchAllOptions): Promise<pipeline[]> => {
		const {
			protocole,
			domain,
			project,
			token,
			username,
			ref,
			source,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		const params = new URLSearchParams({ access_token: token });
		if (username) params.append('username', username);
		if (source) params.append('source', source);
		if (ref) params.append('ref', ref);
		// params.append('ref', 'branchName');
		// params.append('username', 'myName');
		// params.append('source', 'push');
		// params.append('order_by', 'updated_at');
		// params.append('sort', 'desc');
		const url = `${protocole}://${domain}/api/v4/projects/${project}/pipelines/?${params.toString()}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, axiosOptions);
			if (res.data.status === 'running') 'd';
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	post = async (options: postOptions) => {
		const {
			branch,
			variables,
			protocole,
			domain,
			project,
			token,
			allowInsecureCertificate: allowInsecure,
		} = options;
		const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
		const url = `${protocole}://${domain}/api/v4/projects/${project}/pipeline?access_token=${token}`;
		this.logger.request(url, 'post');
		const data = {
			ref: branch,
			variables: variables || [],
		};
		try {
			const res = await axios.post(url, data, axiosOptions);
			const id = res.data.id;
			assertNumber(id);
			this.runningPipelines.push(id);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	arePipelineRunning = async (options: gitlabApiOptions) => {
		const runningPipelines = [];
		const failedPipelines = [...this.failedPipelines];
		const successPipelines = [...this.successPipelines];
		const canceledPipelines = [...this.canceledPipelines];
		for (let i = 0, c = this.runningPipelines.length; i < c; i++) {
			const populatedOption = {
				...options,
				id: this.runningPipelines[i],
			};
			const pipeline = await this.fetch(populatedOption);
			switch (pipeline.status) {
				case 'failed':
					failedPipelines.push(pipeline.id);
					break;
				case 'success':
					successPipelines.push(pipeline.id);
					break;
				case 'canceled':
					canceledPipelines.push(pipeline.id);
					break;
				default:
					runningPipelines.push(pipeline.id);
					break;
			}
		}
		this.runningPipelines = runningPipelines;
		this.failedPipelines = [...new Set(failedPipelines)];
		this.successPipelines = [...new Set(successPipelines)];
		this.canceledPipelines = [...new Set(canceledPipelines)];
		return this.runningPipelines.length === 0;
	};
	getFailedPipelines = () => {
		return this.failedPipelines;
	};
	getSuccessPipelines = () => {
		return this.successPipelines;
	};
	getCanceledPipelines = () => {
		return this.canceledPipelines;
	};
	pushRunningPipeline = (pipelineId: number) => {
		const runningPipelines = [...this.runningPipelines, pipelineId];
		this.runningPipelines = runningPipelines;
	};
}
export default Pipelines;

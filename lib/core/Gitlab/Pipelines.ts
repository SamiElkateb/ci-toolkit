import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
import GitlabApiError from '../Errors/GitlabApiError';
import { checkIsNumber } from '../../utils/validation';
import { assertNumber } from '../../utils/assertions';
type pollParams = {
	fn: () => unknown;
	validate: (value: unknown) => boolean;
	interval: number;
	timeout: number;
};

const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
class Pipelines {
	private conf: Conf;
	private runningPipelines: number[];
	private failedPipelines: number[];
	private successPipelines: number[];
	private canceledPipelines: number[];
	private logger: Log;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Log(conf.logLevel);
		this.runningPipelines = [];
		this.failedPipelines = [];
		this.successPipelines = [];
		this.canceledPipelines = [];
	}
	get = async (id: number) => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/pipelines/${id}?access_token=${this.conf.token}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, { httpsAgent: agent });
			if (res.data.status === 'running') 'd';
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	post = async () => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/pipeline?access_token=${this.conf.token}`;
		this.logger.request(url, 'post');
		const data = {
			ref: 'master',
			variables: [],
		};
		try {
			const res = await axios.post(url, data, { httpsAgent: agent });
			const id = res.data.id;
			assertNumber(id);
			this.runningPipelines.push(id);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	arePipelineRunning = async () => {
		const runningPipelines = [];
		const failedPipelines = [...this.failedPipelines];
		const successPipelines = [...this.successPipelines];
		const canceledPipelines = [...this.canceledPipelines];
		for (let i = 0, c = this.runningPipelines.length; i < c; i++) {
			const pipeline = await this.get(this.runningPipelines[i]);
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
}
export default Pipelines;

import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
import GitlabApiError from '../Errors/GitlabApiError';
import { checkIsNumber } from '../../utils/validation';
import { assertNumber } from '../../utils/assertions';
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
			console.log(res.data);
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
			console.log(res.data.id);
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	arePipelineRunning = async () => {
		const runningPipelines = [];
		const failedPipelines = [];
		const successPipelines = [];
		const canceledPipelines = [];
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
		this.failedPipelines = [this.failedPipelines, ...failedPipelines];
		this.successPipelines = [this.successPipelines, ...successPipelines];
		this.canceledPipelines = [this.canceledPipelines, ...canceledPipelines];
		return this.runningPipelines.length === 0;
	};
}
export default Pipelines;

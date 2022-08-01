import Conf from '../Conf';
import Logger from '../Logger';
import GitlabApiError from '../Errors/GitlabApiError';
import { assertNumber } from '../../utils/assertions/baseTypeAssertions';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
import { gitlabRunJobApiResponseSchema } from '../../models/Gitlab/Jobs';
import { ZodError } from 'zod';
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
    retry?: boolean;
    jobId: number;
    variables?: pipelineVariable[];
}

const axios = require('axios');
class Jobs {
    private runningJobs: number[];
    private failedJobs: number[];
    private successJobs: number[];
    private canceledJobs: number[];
    private logger: Logger;
    constructor(conf: Conf) {
        this.logger = new Logger(conf.logLevel);
        this.runningJobs = [];
        this.failedJobs = [];
        this.successJobs = [];
        this.canceledJobs = [];
    }

    fetch = async (options: fetchOptions) => {
        const {
            id,
            protocole,
            domain,
            project,
            token,
            allowInsecureCertificate: allowInsecure,
        } = options;
        const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
        const url = `${protocole}://${domain}/api/v4/projects/${project}/jobs/${id}?access_token=${token}`;
        this.logger.request(url, 'get');
        try {
            const res = await axios.get(url, axiosOptions);
            if (res.data.status === 'running') 'd';
            return res.data;
        } catch (error) {
            throw new GitlabApiError(error);
        }
    };

    start = async (options: postOptions) => {
        const {
            jobId,
            variables,
            protocole,
            domain,
            retry,
            project,
            token,
            allowInsecureCertificate: allowInsecure,
        } = options;

        const retryParam = retry ? '/retry' : '/play';
        const params = new URLSearchParams({ access_token: token });
        const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
        const url = `${protocole}://${domain}/api/v4/projects/${project}/jobs/${jobId}${retryParam}?${params.toString()}`;
        this.logger.request(url, 'post');
        const data = {
            variables: variables || [],
        };

        try {
            const res = await axios.post(url, data, axiosOptions);
            console.log('JOBS RESPONSE', res);
            const parsedData = gitlabRunJobApiResponseSchema.parse(res.data);
            const id = parsedData.id;
            this.runningJobs.push(id);
            return parsedData;
        } catch (error) {
            switch (error) {
                case ZodError:
                    console.log(error);
                    throw error;
                default:
                    console.log('gitlab api error', error);
                    throw new GitlabApiError(error);
            }
        }
    };

    areJobsRunning = async (options: gitlabApiOptions) => {
        const runningJobs = [];
        const failedJobs = [...this.failedJobs];
        const successJobs = [...this.successJobs];
        const canceledJobs = [...this.canceledJobs];
        for (let i = 0, c = this.runningJobs.length; i < c; i++) {
            const populatedOption = {
                ...options,
                id: this.runningJobs[i],
            };
            const pipeline = await this.fetch(populatedOption);
            switch (pipeline.status) {
                case 'failed':
                    failedJobs.push(pipeline.id);
                    break;
                case 'success':
                    successJobs.push(pipeline.id);
                    break;
                case 'canceled':
                    canceledJobs.push(pipeline.id);
                    break;
                default:
                    runningJobs.push(pipeline.id);
                    break;
            }
        }
        this.runningJobs = runningJobs;
        this.failedJobs = [...new Set(failedJobs)];
        this.successJobs = [...new Set(successJobs)];
        this.canceledJobs = [...new Set(canceledJobs)];
        return this.runningJobs.length === 0;
    };
    getFailedJobs = () => {
        return this.failedJobs;
    };
    getSuccessJobs = () => {
        return this.successJobs;
    };
    getCanceledJobs = () => {
        return this.canceledJobs;
    };
    pushRunningPipeline = (pipelineId: number) => {
        const runningJobs = [...this.runningJobs, pipelineId];
        this.runningJobs = runningJobs;
    };
}
export default Jobs;

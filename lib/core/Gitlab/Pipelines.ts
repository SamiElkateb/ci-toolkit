import Conf from '../Conf';
import Logger from '../Logger';
import GitlabApiError from '../Errors/GitlabApiError';
import { assertNumber } from '../../utils/assertions/baseTypeAssertions';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
import { gitlabRunJobApiResponse } from '../../types/Gitlab/Jobs';

interface FetchOptions extends gitlabApiOptions {
  id: number;
}
interface FetchAllOptions extends gitlabApiOptions {
  username?: string;
  ref?: string;
  source?: string;
}
interface PostOptions extends gitlabApiOptions {
  ref: string;
  variables?: pipelineVariable[];
}

const axios = require('axios');

class Pipelines {
  private runningPipelines: number[];

  private failedPipelines: number[];

  private successPipelines: number[];

  private canceledPipelines: number[];

  private manualPipelines: number[];

  private logger: Logger;

  constructor(conf: Conf) {
    this.logger = new Logger(conf.logLevel);
    this.runningPipelines = [];
    this.failedPipelines = [];
    this.successPipelines = [];
    this.canceledPipelines = [];
    this.manualPipelines = [];
  }

  fetch = async (options: FetchOptions): Promise<pipeline> => {
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
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  fetchJobs = async (
    options: FetchOptions,
  ): Promise<gitlabRunJobApiResponse[]> => {
    const {
      id,
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificate: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const params = new URLSearchParams({ access_token: token });
    const url = `${protocole}://${domain}/api/v4/projects/${project}/pipelines/${id}/jobs?${params.toString()}`;
    this.logger.request(url, 'get');
    try {
      const res = await axios.get(url, axiosOptions);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  fetchAll = async (options: FetchAllOptions): Promise<pipeline[]> => {
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
    const url = `${protocole}://${domain}/api/v4/projects/${project}/pipelines/?${params.toString()}`;
    this.logger.request(url, 'get');
    try {
      const res = await axios.get(url, axiosOptions);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  post = async (options: PostOptions) => {
    const {
      ref,
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
      ref,
      variables: variables || [],
    };
    try {
      const res = await axios.post(url, data, axiosOptions);
      const { id } = res.data;
      assertNumber(id);
      this.runningPipelines.push(id);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  arePipelineRunning = async (options: gitlabApiOptions) => {
    const runningPipelines:number[] = [];
    const failedPipelines = [...this.failedPipelines];
    const successPipelines = [...this.successPipelines];
    const canceledPipelines = [...this.canceledPipelines];
    const manualPipelines = [...this.manualPipelines];
    const promisedPipelines = this.runningPipelines.map((pipeline) => {
      const populatedOption = {
        ...options,
        id: pipeline,
      };
      return this.fetch(populatedOption);
    });

    const pipelines = await Promise.all(promisedPipelines);

    pipelines.forEach((pipeline) => {
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
        case 'manual':
          manualPipelines.push(pipeline.id);
          break;
        default:
          runningPipelines.push(pipeline.id);
          break;
      }
    });

    this.runningPipelines = runningPipelines;
    this.failedPipelines = [...new Set(failedPipelines)];
    this.successPipelines = [...new Set(successPipelines)];
    this.canceledPipelines = [...new Set(canceledPipelines)];
    this.manualPipelines = [...new Set(manualPipelines)];
    return this.runningPipelines.length === 0;
  };

  getFailedPipelines = () => this.failedPipelines;

  getSuccessPipelines = () => this.successPipelines;

  getCanceledPipelines = () => this.canceledPipelines;

  getManualPipelines = () => this.manualPipelines;

  pushRunningPipeline = (pipelineId: number) => {
    const runningPipelines = [...this.runningPipelines, pipelineId];
    this.runningPipelines = runningPipelines;
  };
}
export default Pipelines;

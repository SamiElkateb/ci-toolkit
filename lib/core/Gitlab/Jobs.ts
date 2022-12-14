import { z, ZodError } from 'zod';
import axios from 'axios';
import Conf from '../Conf';
import Logger from '../Logger';
import GitlabApiError from '../Errors/GitlabApiError';
import getHttpsAgent from '../../utils/getHttpsAgent';
import gitlabJobSchema from '../../models/Gitlab/Jobs';

interface FetchOptions extends GitlabApiOptions {
  id: number;
}
interface PostOptions extends GitlabApiOptions {
  retry?: boolean;
  jobId: number;
  variables?: PipelineVariable[];
}

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

  fetchAll = async (options: GitlabApiOptions) => {
    const {
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/jobs?access_token=${token}`;
    this.logger.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = z.array(gitlabJobSchema).parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  fetch = async (options: FetchOptions) => {
    const {
      id,
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/jobs/${id}?access_token=${token}`;
    this.logger.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = gitlabJobSchema.parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  start = async (options: PostOptions) => {
    const {
      jobId,
      variables,
      protocole,
      domain,
      retry,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
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
      const res = await axios.post<unknown>(url, data, axiosOptions);
      const parsedData = gitlabJobSchema.parse(res.data);
      const { id } = parsedData;
      this.runningJobs.push(id);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  areJobsRunning = async (options: GitlabApiOptions) => {
    const runningJobs:number[] = [];
    const failedJobs = [...this.failedJobs];
    const successJobs = [...this.successJobs];
    const canceledJobs = [...this.canceledJobs];

    const promisedJobs = this.runningJobs.map((job) => {
      const populatedOption = {
        ...options,
        id: job,
      };
      return this.fetch(populatedOption);
    });

    const jobs = await Promise.all(promisedJobs);

    jobs.forEach((job) => {
      switch (job.status) {
        case 'failed':
          failedJobs.push(job.id);
          break;
        case 'success':
          successJobs.push(job.id);
          break;
        case 'canceled':
          canceledJobs.push(job.id);
          break;
        default:
          runningJobs.push(job.id);
          break;
      }
    });

    this.runningJobs = runningJobs;
    this.failedJobs = [...new Set(failedJobs)];
    this.successJobs = [...new Set(successJobs)];
    this.canceledJobs = [...new Set(canceledJobs)];
    return this.runningJobs.length === 0;
  };

  getFailedJobs = () => this.failedJobs;

  getSuccessJobs = () => this.successJobs;

  getCanceledJobs = () => this.canceledJobs;

  pushRunningJob = (jobId: number) => {
    const runningJobs = [...this.runningJobs, jobId];
    this.runningJobs = runningJobs;
  };
}

export default Jobs;

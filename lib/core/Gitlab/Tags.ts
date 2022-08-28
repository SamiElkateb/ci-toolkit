import axios from 'axios';
import { z, ZodError } from 'zod';
import Logger from '../Logger';
import GitlabApiError from '../Errors/GitlabApiError';
import getHttpsAgent from '../../utils/getHttpsAgent';
import gitlabTagSchema from '../../models/Gitlab/Tags';
import { versionValidationSchema } from '../../models/others';

type IncrementVersionParams = {
  incrementBy: string;
  version: string;
};
interface PostOptions extends GitlabApiOptions {
  tagName: string;
  ref: string;
}

class Tags {
  static fetch = async (options: GitlabApiOptions, logger?: Logger) => {
    const {
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/repository/tags?access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = z.array(gitlabTagSchema).parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  static post = async (options: PostOptions, logger?: Logger) => {
    const {
      protocole,
      domain,
      project,
      token,
      ref,
      tagName,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/repository/tags?access_token=${token}`;
    const data = {
      ref,
      tag_name: tagName,
    };
    logger?.request(url, 'post');
    try {
      const res = await axios.post<unknown>(url, data, axiosOptions);
      const parsedData = gitlabTagSchema.parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  static fetchLast = async (options: GitlabApiOptions, logger?: Logger) => {
    const data = await Tags.fetch(options, logger);
    const lastTag = data[0].name;
    return lastTag;
  };

  static incrementVersion = (params: IncrementVersionParams) => {
    const { version, incrementBy } = params;
    const parsedVersion = versionValidationSchema.parse(version);
    let [, major, minor, patch] = z.array(z.string()).parse(parsedVersion.match(
      /(\d*)\.(\d*)\.(\d*)/,
    ));
    switch (incrementBy) {
      case 'patch':
        patch = (+patch + 1).toString();
        break;
      case 'minor':
        patch = '0';
        minor = (+minor + 1).toString();
        break;
      case 'major':
        patch = '0';
        minor = '0';
        major = (+major + 1).toString();
        break;
      default:
        throw new Error('Error while increasing tag number');
    }
    const newVersion = `${major}.${minor}.${patch}`;
    return versionValidationSchema.parse(newVersion);
  };
}
export default Tags;

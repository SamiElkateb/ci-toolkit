import Logger from '../Logger';
import { assertVersion } from '../../utils/assertions/customTypesAssertions';
import GitlabApiError from '../Errors/GitlabApiError';
import { getHttpsAgent } from '../../utils/getHttpsAgent';

type IncrementVersionParams = {
  incrementBy: versionIncrement;
  version: unknown;
};
interface PostOptions extends gitlabApiOptions {
  tagName: string;
  ref: string;
}

const axios = require('axios');

class Tags {
  static fetch = async (options: gitlabApiOptions, logger?: Logger) => {
    const {
      protocole,
      domain,
      project,
      token,
      allowInsecureCertificate: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/repository/tags?access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get(url, axiosOptions);
      return res.data;
    } catch (error) {
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
      allowInsecureCertificate: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/projects/${project}/repository/tags?access_token=${token}`;
    const data = {
      ref,
      tag_name: tagName,
    };
    logger?.request(url, 'post');
    try {
      const res = await axios.post(url, data, axiosOptions);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  static fetchLast = async (options: gitlabApiOptions, logger?: Logger) => {
    const data = await Tags.fetch(options, logger);
    const lastTag = data[0].name;
    return lastTag;
  };

  static incrementVersion = (params: IncrementVersionParams): version => {
    const { version, incrementBy } = params;
    assertVersion(version);
    let [, major, minor, patch] = version.match(
      /(\d*)\.(\d*)\.(\d*)/,
    ) as string[];
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
    assertVersion(newVersion);
    return newVersion;
  };
}
export default Tags;

import Conf from '../Conf';
import { assertExists } from '../../utils/assertions/baseTypeAssertions';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
import Logger from '../Logger';

interface FetchOptions extends Omit<gitlabApiOptions, 'project'> {
  username: string;
}
interface FetchIdsOptions extends Omit<gitlabApiOptions, 'project'> {
  usernames: string[];
}
type FetchMeOptions = Omit<gitlabApiOptions, 'project'>;
const axios = require('axios');

class Users {
  private conf: Conf;

  private logger: Logger;

  constructor(conf: Conf) {
    this.conf = conf;
    this.logger = new Logger(conf.logLevel);
  }

  static fetch = async (
    options: FetchOptions,
    logger?: Logger,
  ): Promise<user[]> => {
    const {
      username,
      protocole,
      domain,
      token,
      allowInsecureCertificate: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/users?username=${username}&access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get(url, axiosOptions);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  static fetchMe = async (
    options: FetchMeOptions,
    logger?: Logger,
  ): Promise<user> => {
    const {
      protocole,
      domain,
      token,
      allowInsecureCertificate: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/user?access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get(url, axiosOptions);
      return res.data;
    } catch (error) {
      throw new GitlabApiError(error);
    }
  };

  static fetchId = async (options: FetchOptions): Promise<number> => {
    const user = (await Users.fetch(options))[0];
    assertExists(user, lang.noUser(options.username));
    return user.id;
  };

  static fetchIds = async (options: FetchIdsOptions): Promise<number[]> => {
    const { usernames } = options;
    const promisedUsersIds = usernames.map((username) => {
      const fetchOptions = { ...options, username };
      return Users.fetchId(fetchOptions);
    });
    const userIds = Promise.all(promisedUsersIds);
    return userIds;
  };
}
export default Users;

import axios from 'axios';
import { z, ZodError } from 'zod';
import assertExists from '../../utils/assertExists';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
import getHttpsAgent from '../../utils/getHttpsAgent';
import Logger from '../Logger';
import gitlabUserSchema from '../../models/Gitlab/Users';

interface FetchOptions extends Omit<GitlabApiOptions, 'project'> {
  username: string;
}
interface FetchIdsOptions extends Omit<GitlabApiOptions, 'project'> {
  usernames: string[];
}
type FetchMeOptions = Omit<GitlabApiOptions, 'project'>;

class Users {
  static fetch = async (
    options: FetchOptions,
    logger?: Logger,
  ) => {
    const {
      username,
      protocole,
      domain,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/users?username=${username}&access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = z.array(gitlabUserSchema).parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
      throw new GitlabApiError(error);
    }
  };

  static fetchMe = async (
    options: FetchMeOptions,
    logger?: Logger,
  ) => {
    const {
      protocole,
      domain,
      token,
      allowInsecureCertificates: allowInsecure,
    } = options;
    const axiosOptions = { httpsAgent: getHttpsAgent(allowInsecure) };
    const url = `${protocole}://${domain}/api/v4/user?access_token=${token}`;
    logger?.request(url, 'get');
    try {
      const res = await axios.get<unknown>(url, axiosOptions);
      const parsedData = gitlabUserSchema.parse(res.data);
      return parsedData;
    } catch (error) {
      if (error instanceof ZodError) throw error;
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

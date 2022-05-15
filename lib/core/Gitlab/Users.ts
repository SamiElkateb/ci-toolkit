import Conf from '../Conf';
import { assertExists } from '../../utils/assertions/baseTypeAssertions';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
import Logger from '../Logger';

interface fetchOptions extends Omit<gitlabApiOptions, 'project'> {
	username: string;
}
interface fetchIdsOptions extends Omit<gitlabApiOptions, 'project'> {
	usernames: string[];
}
type fetchMeOptions = Omit<gitlabApiOptions, 'project'>;
const axios = require('axios');
class Users {
	private conf: Conf;
	private logger: Logger;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Logger(conf.logLevel);
	}
	static fetch = async (
		options: fetchOptions,
		logger?: Logger
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
		options: fetchMeOptions,
		logger?: Logger
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
	static fetchId = async (options: fetchOptions): Promise<number> => {
		const user = (await Users.fetch(options))[0];
		assertExists(user, lang.noUser(options.username));
		return user.id;
	};
	static fetchIds = async (options: fetchIdsOptions): Promise<number[]> => {
		const userIds = [];
		const { usernames } = options;
		for (let i = 0, c = usernames.length; i < c; i++) {
			const fetchOptions = { ...options, username: usernames[i] };
			const id = await Users.fetchId(fetchOptions);
			userIds.push(id);
		}
		return userIds;
	};
}
export default Users;

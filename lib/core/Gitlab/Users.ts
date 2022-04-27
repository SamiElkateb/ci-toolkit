import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
import { assertExists } from '../../utils/assertions';
import lang from '../lang/en';
import GitlabApiError from '../Errors/GitlabApiError';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
class Users {
	private conf: Conf;
	private logger: Log;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Log(conf.logLevel);
	}
	get = async (username: string): Promise<user[]> => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/users?username=${username}&access_token=${this.conf.token}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	getMe = async (): Promise<user> => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/user?access_token=${this.conf.token}`;
		this.logger.request(url, 'get');
		try {
			const res = await axios.get(url, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	getId = async (username: string): Promise<number> => {
		const user = (await this.get(username))[0];
		assertExists(user, lang.noUser(username));
		return user.id;
	};
	getIds = async (usernames: string[]): Promise<number[]> => {
		const userIds = [];
		for (let i = 0, c = usernames.length; i < c; i++) {
			const user = (await this.get(usernames[i]))[0];
			assertExists(user, lang.noUser(usernames[i]));
			userIds.push(user.id);
		}
		return userIds;
	};
}
export default Users;

import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
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
	get = async (username: string) => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/users?username=${username}&access_token=${this.conf.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getId = async (username: string) => {
		const user = await this.get(username);
		const id = user.id;
		return id;
	};
}
export default Users;

import Conf from './Conf';
import https = require('https');
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
class Tags {
	private conf: Conf;
	constructor(conf: Conf) {
		this.conf = conf;
	}
	get = async () => {
		const url = `${this.conf.protocole}://${this.conf.domain}/api/v4/projects/${this.conf.projectId}/repository/tags?access_token=${this.conf.token}`;
		const res = await axios.get(url, { httpsAgent: agent });
		return res.data;
	};
	getLast = async () => {
		const data = await this.get();
		const lastTag = data[0].name;
		return lastTag;
	};
}
export default Tags;

import Conf from '../Conf';
import https = require('https');
import Log from '../Log';
import { assertVersion } from '../../utils/assertions';
type increaseTagsParams = {
	update: 'patch' | 'minor' | 'major';
	tag: unknown;
};
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');
class Tags {
	private conf: Conf;
	private logger: Log;
	constructor(conf: Conf) {
		this.conf = conf;
		this.logger = new Log(conf.logLevel);
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
	static increaseTag = (params: increaseTagsParams): version => {
		const { tag, update } = params;
		assertVersion(tag);
		let [, major, minor, patch] = tag.match(/(\d*)\.(\d*)\.(\d*)/) as [
			string,
			string,
			string,
			string
		];
		switch (update) {
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
				throw 'Error while increasing tag number';
		}
		const newVersion = `${major}.${minor}.${patch}`;
		assertVersion(newVersion);
		return newVersion;
	};
}
export default Tags;

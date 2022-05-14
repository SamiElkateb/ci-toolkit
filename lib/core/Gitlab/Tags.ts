import Conf from '../Conf';
import https = require('https');
import Logger from '../Logger';
import { assertVersion } from '../../utils/assertions/customTypesAssertions';
import GitlabApiError from '../Errors/GitlabApiError';
type increaseTagsParams = {
	update: 'patch' | 'minor' | 'major';
	tag: unknown;
};
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

const axios = require('axios');

type fetchOptions = {
	protocole: protocole;
	domain: string;
	project: string;
	token: string;
};
class Tags {
	constructor() {}
	static fetch = async (options: fetchOptions, logger?: Logger) => {
		const { protocole, domain, project, token } = options;
		const url = `${protocole}://${domain}/api/v4/projects/${project}/repository/tags?access_token=${token}`;
		logger?.request(url, 'get');
		try {
			const res = await axios.get(url, { httpsAgent: agent });
			return res.data;
		} catch (error) {
			throw new GitlabApiError(error);
		}
	};
	static fetchLast = async (options: fetchOptions, logger?: Logger) => {
		const data = await Tags.fetch(options, logger);
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

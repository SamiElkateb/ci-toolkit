import Logger from '../Logger';
import { assertVersion } from '../../utils/assertions/customTypesAssertions';
import GitlabApiError from '../Errors/GitlabApiError';
import { getHttpsAgent } from '../../utils/getHttpsAgent';
type incrementVersionParams = {
	incrementBy: versionIncrement;
	version: unknown;
};

const axios = require('axios');

class Tags {
	constructor() {}
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
	static fetchLast = async (options: gitlabApiOptions, logger?: Logger) => {
		const data = await Tags.fetch(options, logger);
		const lastTag = data[0].name;
		return lastTag;
	};
	static incrementVersion = (params: incrementVersionParams): version => {
		const { version, incrementBy } = params;
		assertVersion(version);
		let [, major, minor, patch] = version.match(/(\d*)\.(\d*)\.(\d*)/) as [
			string,
			string,
			string,
			string
		];
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
				throw 'Error while increasing tag number';
		}
		const newVersion = `${major}.${minor}.${patch}`;
		assertVersion(newVersion);
		return newVersion;
	};
}
export default Tags;

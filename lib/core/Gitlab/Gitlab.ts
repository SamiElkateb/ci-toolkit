import MergeRequests from './MergeRequests';
import Tags from './Tags';
import https = require('https');
import Conf from './Conf';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	public mergeRequests: MergeRequests;
	public tags: Tags;
	constructor(conf: Conf) {
		this.mergeRequests = new MergeRequests(conf);
		this.tags = new Tags(conf);
	}
}

export default Gitlab;

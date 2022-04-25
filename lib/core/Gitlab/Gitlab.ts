import MergeRequests from './MergeRequests';
import Tags from './Tags';
import https = require('https');
import Conf from '../Conf';
import Users from './Users';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	public mergeRequests: MergeRequests;
	public tags: Tags;
	public users: Users;
	constructor(conf: Conf) {
		this.mergeRequests = new MergeRequests(conf);
		this.tags = new Tags(conf);
		this.users = new Users(conf);
	}
}

export default Gitlab;

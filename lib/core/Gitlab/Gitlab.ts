import MergeRequests from './MergeRequests';
import Tags from './Tags';
import https = require('https');
import Conf from '../Conf';
import Users from './Users';
import Pipelines from './Pipelines';
const rejectUnauthorized = false;
const agent = new https.Agent({ rejectUnauthorized });

class Gitlab {
	public mergeRequests: MergeRequests;
	public tags: Tags;
	public users: Users;
	public pipelines: Pipelines;
	constructor(conf: Conf) {
		this.mergeRequests = new MergeRequests(conf);
		this.tags = new Tags();
		this.users = new Users(conf);
		this.pipelines = new Pipelines(conf);
	}
}

export default Gitlab;

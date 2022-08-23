import MergeRequests from './MergeRequests';
import Tags from './Tags';
import Conf from '../Conf';
import Users from './Users';
import Pipelines from './Pipelines';

class Gitlab {
  public mergeRequests: MergeRequests;

  public tags: Tags;

  public users: Users;

  public pipelines: Pipelines;

  constructor(conf: Conf) {
    this.mergeRequests = new MergeRequests();
    this.tags = new Tags();
    this.users = new Users();
    this.pipelines = new Pipelines(conf);
  }
}

export default Gitlab;

import nock from 'nock';
import axios from 'axios';
import GITLAB_RESPONSES from '../__fixtures__/responses/gitlab';
import GITLAB_EXPECTED_REQUEST_BODY from '../__fixtures__/requests/gitlab';

const workingServer = () => {
  let pipelineCalls = 0;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require
  axios.defaults.adapter = require('axios/lib/adapters/http');
  nock.disableNetConnect();
  nock('https://working-server.com')
    .persist()
    .get('/api/v4/projects/testproject/jobs?access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getProjectJobs)
    .get('/api/v4/user?access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getCurrentUser)
    .get('/api/v4/users?username=JohnDoe&access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getUsers)
    .post('/api/v4/projects/JohnDoe%2Ftestproject/merge_requests?access_token=super_secret_token', GITLAB_EXPECTED_REQUEST_BODY.createMergeRequest)
    .reply(200, GITLAB_RESPONSES.createMergeRequest)
    .get('/api/v4/projects/JohnDoe%2Ftestproject/merge_requests')
    .query({ state: 'opened', access_token: 'super_secret_token' })
    .reply(200, GITLAB_RESPONSES.getMergeRequests)
    .put('/api/v4/projects/JohnDoe%2Ftestproject/merge_requests/24/merge?access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.mergeMergeRequest)
    .get('/api/v4/projects/JohnDoe%2Ftestproject/pipelines/')
    .query({ username: 'JohnDoe', access_token: 'super_secret_token', source: 'merge_request_event' })
    .reply(200, GITLAB_RESPONSES.getPipelinesRunning)
    .get('/api/v4/projects/JohnDoe%2Ftestproject/pipelines/')
    .query({
      username: 'JohnDoe', access_token: 'super_secret_token', source: 'push', ref: 'main',
    })
    .reply(200, GITLAB_RESPONSES.getPipelinesRunning)
    .get('/api/v4/projects/JohnDoe%2Ftestproject/pipelines/123456789?access_token=super_secret_token')
    .reply(200, () => {
      if (pipelineCalls < 2) {
        pipelineCalls += 1;
        return GITLAB_RESPONSES.getPipelinesRunning[0];
      }
      return GITLAB_RESPONSES.getPipelinesManual[0];
    })
    .get(/.*/)
    .reply(401, GITLAB_RESPONSES.unauthorized)
    .post(/.*/)
    .reply(401, GITLAB_RESPONSES.unauthorized);
};
export default workingServer;

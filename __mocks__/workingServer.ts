import nock from 'nock';
import axios from 'axios';
import GITLAB_RESPONSES from '../__fixtures__/responses/gitlab';
import GITLAB_EXPECTED_REQUEST_BODY from '../__fixtures__/requests/gitlab';

const workingServer = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require
  axios.defaults.adapter = require('axios/lib/adapters/http');
  nock('https://working-server.com')
    .get('/api/v4/projects/testproject/jobs?access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getProjectJobs)
    .get('/api/v4/user?access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getCurrentUser)
    .get('/api/v4/users?username=JohnDoe&access_token=super_secret_token')
    .reply(200, GITLAB_RESPONSES.getUsers)
  // .filteringRequestBody(/password=[^&]*/g, 'password=XXX')
    .post('/api/v4/projects/JohnDoe%2Ftestproject/merge_requests?access_token=super_secret_token', GITLAB_EXPECTED_REQUEST_BODY.createMergeRequest)
    .reply(200, GITLAB_RESPONSES.createMergeRequest)
    .get(/.*/)
    .reply(401, GITLAB_RESPONSES.unauthorized)
    .post(/.*/)
    .reply(401, GITLAB_RESPONSES.unauthorized);
};

export default workingServer;

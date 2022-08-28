import nock from 'nock';
import unauthorized from '../../__fixtures__/responses/gitlab/unauthorized';

const workingServer = nock('https://working-server.com')
  .get(/.*/)
  .reply(401, unauthorized)
  .post(/.*/)
  .reply(401, unauthorized)
  .get('/api/v4/projects/testproject/jobs?access_token=superSecretToken')
  .reply(404)
  .post('/users', {
    username: 'pgte',
    email: 'pedro.teixeira@gmail.com',
  })
  .reply(201, {
    ok: true,
    id: '123ABC',
    rev: '946B7D1C',
  })
  .get('/users/123ABC')
  .reply(200, {
    _id: '123ABC',
    _rev: '946B7D1C',
    username: 'pgte',
    email: 'pedro.teixeira@gmail.com',
  });

export default workingServer;

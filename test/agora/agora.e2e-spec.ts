import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Agora Module', () => {
  const app = APP_URL;
  let apiToken: string;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;
  });

  it('should reject unauthenticated request: /api/v1/agora/recording/start (POST)', () => {
    return request(app)
      .post('/api/v1/agora/recording/start')
      .send({})
      .expect(401);
  });

  it('should require a valid body when authenticated: /api/v1/agora/recording/stop (POST)', () => {
    return request(app)
      .post('/api/v1/agora/recording/stop')
      .auth(apiToken, { type: 'bearer' })
      .send({})
      .expect(({ status }) => {
        expect([400, 422]).toContain(status);
      });
  });
});

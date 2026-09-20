import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Chat Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let huberId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    apiToken = tester.token;

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
    expect(huberId).toBeDefined();
  });

  it('should get conversations: /api/v1/chat (GET)', () => {
    return request(app)
      .get('/api/v1/chat')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should send a chat message: /api/v1/chat (POST)', () => {
    return request(app)
      .post('/api/v1/chat')
      .auth(apiToken, { type: 'bearer' })
      .send({
        message: `e2e hello ${Date.now()}`,
        recipientId: huberId,
        chatType: { id: 1 },
      })
      .expect(({ status }) => {
        expect([201, 200]).toContain(status);
      });
  });

  it('should get chat with a user: /api/v1/chat/user/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/chat/user/${huberId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get user status: /api/v1/chat/user/:id/status (GET)', () => {
    return request(app)
      .get(`/api/v1/chat/user/${huberId}/status`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(typeof body.isOnline).toBe('boolean');
      });
  });
});

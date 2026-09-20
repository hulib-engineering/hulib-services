import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';
import { registerUser, login } from '../utils/helpers';

describe('Notifications Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let testerId: number;
  let adminToken: string;
  let adminId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    apiToken = tester.token;
    testerId = Number(tester.user.id);

    adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    const { body: adminMe } = await request(app)
      .get('/api/v1/auth/me')
      .auth(adminToken, { type: 'bearer' });
    adminId = Number(adminMe.id);
  });

  it('should get notifications with unseen count: /api/v1/notifications (GET)', () => {
    return request(app)
      .get('/api/v1/notifications')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.unseenCount).toBeDefined();
      });
  });

  it('should get unseen notification count: /api/v1/notifications/unseen-count (GET)', () => {
    return request(app)
      .get('/api/v1/notifications/unseen-count')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.unseenCount).toBeDefined();
      });
  });

  it('should create a notification as admin: /api/v1/notifications (POST)', () => {
    return request(app)
      .post('/api/v1/notifications')
      .auth(adminToken, { type: 'bearer' })
      .send({
        recipientId: testerId,
        senderId: adminId,
        type: 'other',
        extraNote: 'e2e notification',
      })
      .expect(201);
  });

  it('should mark a notification as read: /api/v1/notifications/:id (PATCH)', async () => {
    const { body } = await request(app)
      .get('/api/v1/notifications')
      .auth(apiToken, { type: 'bearer' })
      .query({ limit: 1 })
      .expect(200);

    const notifId = body.data?.[0]?.id;
    expect(notifId).toBeDefined();

    await request(app)
      .patch(`/api/v1/notifications/${notifId}`)
      .auth(apiToken, { type: 'bearer' })
      .send({})
      .expect(({ status }) => {
        expect([200, 201]).toContain(status);
      });
  });
});

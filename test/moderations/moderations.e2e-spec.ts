import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';
import { registerUser, login } from '../utils/helpers';

describe('Moderations Module', () => {
  const app = APP_URL;
  let adminToken: string;
  let targetUserId: number;

  beforeAll(async () => {
    adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    targetUserId = Number((await registerUser()).user.id);
  });

  it('should list moderations for a user: /api/v1/moderations?userId= (GET)', () => {
    return request(app)
      .get('/api/v1/moderations')
      .query({ userId: targetUserId })
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('should warn and unwarn a user: /api/v1/moderations/warn & /unwarn (POST)', () => {
    return request(app)
      .post('/api/v1/moderations/warn')
      .auth(adminToken, { type: 'bearer' })
      .send({ userId: targetUserId })
      .expect(({ status }) => {
        expect([200, 201]).toContain(status);
      })
      .then(() =>
        request(app)
          .post('/api/v1/moderations/unwarn')
          .auth(adminToken, { type: 'bearer' })
          .send({ userId: targetUserId })
          .expect(({ status }) => {
            expect([200, 201]).toContain(status);
          }),
      );
  });

  it('should ban and unban a user: /api/v1/moderations/ban & /unban (POST)', () => {
    return request(app)
      .post('/api/v1/moderations/ban')
      .auth(adminToken, { type: 'bearer' })
      .send({ userId: targetUserId })
      .expect(({ status }) => {
        expect([200, 201]).toContain(status);
      })
      .then(() =>
        request(app)
          .post('/api/v1/moderations/unban')
          .auth(adminToken, { type: 'bearer' })
          .send({ userId: targetUserId })
          .expect(({ status }) => {
            expect([200, 201]).toContain(status);
          }),
      );
  });
});

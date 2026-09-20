import request from 'supertest';
import { APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';
import { login } from '../utils/helpers';

describe('Appeals Module', () => {
  const app = APP_URL;
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  const seededAppealId = 1;

  it('should get appeal detail as admin: /api/v1/appeals/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/appeals/${seededAppealId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);
  });

  it('should review appeal as admin: /api/v1/appeals/:id (PATCH)', () => {
    return request(app)
      .patch(`/api/v1/appeals/${seededAppealId}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ status: 'rejected' })
      .expect(200);
  });
});

import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Users Module - Self service', () => {
  const app = APP_URL;
  let apiToken: string;
  let testerId: number;
  let huberId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    apiToken = tester.token;
    testerId = Number(tester.user.id);

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
  });

  it('should get own profile with const lookups: /api/v1/users/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/users/${testerId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.role?.id).toBeDefined();
        expect(body.role?.name).toBeDefined();
        expect(body.gender?.id).toBeDefined();
        expect(body.gender?.name).toBeDefined();
        expect(body.status?.id).toBeDefined();
        expect(body.status?.name).toBeDefined();
      });
  });

  it('should update own language code: /api/v1/users/me/language (PATCH)', () => {
    return request(app)
      .patch('/api/v1/users/me/language')
      .auth(apiToken, { type: 'bearer' })
      .send({ languageCode: 'en' })
      .expect(200);
  });

  it('should get a huber profile: /api/v1/users/:id (GET)', () => {
    expect(huberId).toBeDefined();
    return request(app)
      .get(`/api/v1/users/${huberId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200);
  });
});

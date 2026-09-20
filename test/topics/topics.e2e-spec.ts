import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, login, deleteStatus } from '../utils/helpers';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Topics Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let adminToken: string;
  let topicId: number;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;
    adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const { body } = await request(app).get('/api/v1/topics').expect(200);
    topicId = body.data?.[0]?.id;
    expect(topicId).toBeDefined();
  });

  it('should list topics: /api/v1/topics (GET)', () => {
    return request(app)
      .get('/api/v1/topics')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
      });
  });

  it('should get a topic: /api/v1/topics/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/topics/${topicId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(topicId);
      });
  });

  it('should create/update/delete a topic as admin: /api/v1/topics (POST/PATCH/DELETE)', async () => {
    const created = await request(app)
      .post('/api/v1/topics')
      .auth(adminToken, { type: 'bearer' })
      .send({ name: `E2E Topic ${Date.now()}` })
      .expect(201);

    const id = created.body?.id;
    expect(id).toBeDefined();

    await request(app)
      .patch(`/api/v1/topics/${id}`)
      .auth(adminToken, { type: 'bearer' })
      .send({ name: `E2E Topic Updated ${Date.now()}` })
      .expect(200);

    await request(app)
      .delete(`/api/v1/topics/${id}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });
});

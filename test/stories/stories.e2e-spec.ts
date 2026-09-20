import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, login } from '../utils/helpers';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../utils/constants';

describe('Stories Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let adminToken: string;
  let storyId: number;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;
    adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const { body } = await request(app).get('/api/v1/stories').expect(200);
    storyId = body.data?.[0]?.id;
    expect(storyId).toBeDefined();
  });

  it('should list stories: /api/v1/stories (GET)', () => {
    return request(app)
      .get('/api/v1/stories')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
      });
  });

  it('should get a story detail: /api/v1/stories/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/stories/${storyId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(storyId);
      });
  });

  it('should get story topics: /api/v1/stories/:id/topics (GET)', () => {
    return request(app)
      .get(`/api/v1/stories/${storyId}/topics`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get story reviews overview: /api/v1/stories/:id/reviews-overview (GET)', () => {
    return request(app)
      .get(`/api/v1/stories/${storyId}/reviews-overview`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
      });
  });

  it('should get contest participants: /api/v1/stories/contest-participants (GET)', () => {
    return request(app).get('/api/v1/stories/contest-participants').expect(200);
  });

  it('should like a story: /api/v1/stories/:id/like (POST)', () => {
    return request(app)
      .post(`/api/v1/stories/${storyId}/like`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200);
  });

  it('should get admin story queue: /api/v1/admin/stories (GET)', () => {
    return request(app)
      .get('/api/v1/admin/stories')
      .auth(adminToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
      });
  });

  it('should review a pending story: /api/v1/admin/stories/:id/review (PATCH)', async () => {
    const { body } = await request(app)
      .get('/api/v1/admin/stories')
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    const pendingId = body.data?.[0]?.id;
    expect(pendingId).toBeDefined();

    await request(app)
      .patch(`/api/v1/admin/stories/${pendingId}/review`)
      .auth(adminToken, { type: 'bearer' })
      .send({ publishStatus: 'rejected', rejectionReason: 'e2e review' })
      .expect(200);
  });
});

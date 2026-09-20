import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, deleteStatus } from '../utils/helpers';

describe('Story Reviews Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let storyId: number;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;

    const { body } = await request(app).get('/api/v1/stories').expect(200);
    storyId = body.data?.[0]?.id;
    expect(storyId).toBeDefined();
  });

  it('should create a story review: /api/v1/story-reviews (POST)', () => {
    return request(app)
      .post('/api/v1/story-reviews')
      .auth(apiToken, { type: 'bearer' })
      .send({
        storyId,
        rating: 4,
        title: `E2E review ${Date.now()}`,
        comment: 'e2e comment',
      })
      .expect(201);
  });

  it('should list story reviews: /api/v1/story-reviews?storyId= (GET)', () => {
    return request(app)
      .get('/api/v1/story-reviews')
      .query({ storyId })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toBeDefined();
      });
  });

  it('should get/delete own review: /api/v1/story-reviews/:id (GET/DELETE)', async () => {
    const { body } = await request(app)
      .get('/api/v1/story-reviews')
      .query({ storyId, limit: 1 })
      .expect(200);

    const reviewId = body.data?.[0]?.id;
    expect(reviewId).toBeDefined();

    await request(app).get(`/api/v1/story-reviews/${reviewId}`).expect(200);

    await request(app)
      .delete(`/api/v1/story-reviews/${reviewId}`)
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });
});

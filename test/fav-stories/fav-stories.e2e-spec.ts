import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, deleteStatus } from '../utils/helpers';

describe('Fav Stories Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let testerId: number;
  let storyId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    apiToken = tester.token;
    testerId = Number(tester.user.id);

    const { body } = await request(app).get('/api/v1/stories').expect(200);
    storyId = body.data?.[0]?.id;
    expect(storyId).toBeDefined();
  });

  it('should add a story to favorites: /api/v1/fav-stories (POST)', () => {
    return request(app)
      .post('/api/v1/fav-stories')
      .auth(apiToken, { type: 'bearer' })
      .send({ userId: testerId, storyId })
      .expect(201);
  });

  it('should list favorite stories: /api/v1/fav-stories?userId= (GET)', () => {
    return request(app)
      .get('/api/v1/fav-stories')
      .query({ userId: testerId })
      .expect(200);
  });

  it('should remove a story from favorites: /api/v1/fav-stories/:storyId (DELETE)', () => {
    return request(app)
      .del(`/api/v1/fav-stories/${storyId}`)
      .query({ userId: testerId })
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });
});

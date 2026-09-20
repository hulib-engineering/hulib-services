import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Books Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let huberId: number;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
    expect(huberId).toBeDefined();
  });

  it('should create a book: /api/v1/books (POST)', async () => {
    const { body } = await request(app)
      .post('/api/v1/books')
      .auth(apiToken, { type: 'bearer' })
      .send({
        title: `E2E Book ${Date.now()}`,
        authorId: huberId,
        tag: [],
      })
      .expect(201);

    expect(body?.id).toBeDefined();

    await request(app)
      .get(`/api/v1/books/${body.id}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200);
  });
});

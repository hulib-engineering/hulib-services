import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Stickers Module', () => {
  const app = APP_URL;
  let apiToken: string;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;
  });

  it('should list stickers: /api/v1/stickers (GET)', () => {
    return request(app)
      .get('/api/v1/stickers')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        if (body.length) {
          expect(body[0].id).toBeDefined();
          expect(body[0].name).toBeDefined();
        }
      });
  });
});

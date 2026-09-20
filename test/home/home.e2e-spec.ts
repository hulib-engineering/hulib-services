import request from 'supertest';
import { APP_URL } from '../utils/constants';

describe('Home Module', () => {
  const app = APP_URL;

  it('should return app name: / (GET)', () => {
    return request(app)
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBeDefined();
      });
  });
});

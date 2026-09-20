import request from 'supertest';
import { APP_URL } from '../utils/constants';

describe('Search Module', () => {
  const app = APP_URL;

  it('should search without keyword: /api/search (GET)', () => {
    return request(app)
      .get('/api/search')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
      });
  });

  it('should search by keyword: /api/search?keyword= (GET)', () => {
    return request(app)
      .get('/api/search')
      .query({ keyword: 'a' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
      });
  });
});

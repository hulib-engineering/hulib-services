import request from 'supertest';
import { APP_URL } from '../utils/constants';

describe('Schedules Module', () => {
  const app = APP_URL;

  it('should list all schedules: /api/schedules (GET)', () => {
    return request(app)
      .get('/api/schedules')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });
});

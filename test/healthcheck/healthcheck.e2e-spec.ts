import request from 'supertest';
import { APP_URL } from '../utils/constants';

describe('Healthcheck Module', () => {
  const app = APP_URL;

  it('should return status OK: /api/healthcheck (GET)', () => {
    return request(app).get('/api/healthcheck').expect(200);
  });
});

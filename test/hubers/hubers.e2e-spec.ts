import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Hubers Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let huberId: number;
  let huberPeriod: string;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
    expect(huberId).toBeDefined();
    huberPeriod = String(huberId);
  });

  it('should list hubers: /api/v1/hubers (GET)', () => {
    return request(app)
      .get('/api/v1/hubers')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
      });
  });

  it('should get huber booked sessions: /api/v1/hubers/:id/booked-sessions (GET)', () => {
    return request(app)
      .get(`/api/v1/hubers/${huberPeriod}/booked-sessions`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should validate huber availability: /api/v1/hubers/:id/validate-availability (POST)', () => {
    return request(app)
      .post(`/api/v1/hubers/${huberPeriod}/validate-availability`)
      .auth(apiToken, { type: 'bearer' })
      .send({ startAt: '2099-12-31T09:00:00.000Z' })
      .expect(200)
      .expect(({ body }) => {
        expect(typeof body.booked).toBe('boolean');
      });
  });

  it('should get huber stories: /api/v1/hubers/:id/stories (GET)', () => {
    return request(app)
      .get(`/api/v1/hubers/${huberPeriod}/stories`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toBeDefined();
      });
  });
});

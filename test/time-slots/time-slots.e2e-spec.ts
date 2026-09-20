import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser } from '../utils/helpers';

describe('Time Slots Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let huberId: number;
  let slotId: number;

  beforeAll(async () => {
    apiToken = (await registerUser()).token;

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
    expect(huberId).toBeDefined();

    const { body: slots } = await request(app)
      .get(`/api/v1/time-slots/huber/${huberId}`)
      .expect(200);
    slotId = slots[0]?.id;
  });

  it('should get own time slots: /api/v1/time-slots (GET)', () => {
    return request(app)
      .get('/api/v1/time-slots')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get time slots of a huber: /api/v1/time-slots/huber/:id (GET)', () => {
    return request(app)
      .get(`/api/v1/time-slots/huber/${huberId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get a time slot: /api/v1/time-slots/:id (GET)', () => {
    expect(slotId).toBeDefined();
    return request(app).get(`/api/v1/time-slots/${slotId}`).expect(200);
  });
});

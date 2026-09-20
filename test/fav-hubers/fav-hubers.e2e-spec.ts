import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, deleteStatus } from '../utils/helpers';

describe('Fav Hubers Module', () => {
  const app = APP_URL;
  let testerId: number;
  let huberId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    testerId = Number(tester.user.id);

    const { body } = await request(app).get('/api/v1/hubers').expect(200);
    huberId = body.data?.[0]?.id;
    expect(huberId).toBeDefined();
  });

  it('should add a favorite huber: /api/v1/fav-hubers (POST)', () => {
    return request(app)
      .post('/api/v1/fav-hubers')
      .send({ userId: testerId, huberId })
      .expect(201);
  });

  it('should list favorite hubers: /api/v1/fav-hubers/:userId (GET)', () => {
    return request(app).get(`/api/v1/fav-hubers/${testerId}`).expect(200);
  });

  it('should remove a favorite huber: /api/v1/fav-hubers/:huberId?userId= (DELETE)', () => {
    return request(app)
      .del(`/api/v1/fav-hubers/${huberId}`)
      .query({ userId: testerId })
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });

  it('should remove all favorite hubers: /api/v1/fav-hubers?userId= (DELETE)', () => {
    return request(app)
      .del('/api/v1/fav-hubers')
      .query({ userId: testerId })
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });
});

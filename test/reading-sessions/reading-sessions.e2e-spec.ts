import request from 'supertest';
import { APP_URL } from '../utils/constants';
import { registerUser, deleteStatus } from '../utils/helpers';

describe('Reading Sessions Module', () => {
  const app = APP_URL;
  let apiToken: string;
  let testerId: number;
  let huberId: number;
  let storyId: number;

  beforeAll(async () => {
    const tester = await registerUser();
    apiToken = tester.token;
    testerId = Number(tester.user.id);

    const { body: hubers } = await request(app)
      .get('/api/v1/hubers')
      .expect(200);
    huberId = hubers.data?.[0]?.id;
    expect(huberId).toBeDefined();

    const { body: stories } = await request(app)
      .get(`/api/v1/hubers/${huberId}/stories`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200);
    storyId = stories.data?.[0]?.id;
  });

  it('should create a reading session: /api/v1/reading-sessions (POST)', () => {
    return request(app)
      .post('/api/v1/reading-sessions')
      .auth(apiToken, { type: 'bearer' })
      .send({
        humanBookId: huberId,
        readerId: testerId,
        storyId,
        startTime: '2099-01-01T09:00:00.000Z',
        endTime: '2099-01-01T10:00:00.000Z',
        startedAt: '2099-01-01T09:00:00.000Z',
        endedAt: '2099-01-01T10:00:00.000Z',
      })
      .expect(201);
  });

  it('should list reading sessions: /api/v1/reading-sessions (GET)', () => {
    return request(app)
      .get('/api/v1/reading-sessions')
      .auth(apiToken, { type: 'bearer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('should get/update/delete own reading session: /api/v1/reading-sessions/:id (GET/PATCH/DELETE)', async () => {
    const { body } = await request(app)
      .get('/api/v1/reading-sessions')
      .auth(apiToken, { type: 'bearer' });

    const sessionId = body[0]?.id;
    expect(sessionId).toBeDefined();

    await request(app)
      .get(`/api/v1/reading-sessions/${sessionId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(200);

    await request(app)
      .patch(`/api/v1/reading-sessions/${sessionId}`)
      .auth(apiToken, { type: 'bearer' })
      .send({ note: 'e2e updated note' })
      .expect(200);

    await request(app)
      .delete(`/api/v1/reading-sessions/${sessionId}`)
      .auth(apiToken, { type: 'bearer' })
      .expect(({ status }) => {
        expect(deleteStatus).toContain(status);
      });
  });
});

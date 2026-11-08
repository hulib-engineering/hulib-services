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

  const createFinishedSession = async (startedAt: string, endedAt: string) => {
    const { body: created } = await request(app)
      .post('/api/v1/reading-sessions')
      .auth(apiToken, { type: 'bearer' })
      .send({
        humanBookId: huberId,
        readerId: testerId,
        storyId,
        startTime: startedAt,
        endTime: endedAt,
        startedAt,
        endedAt,
      })
      .expect(201);

    await request(app)
      .patch(`/api/v1/reading-sessions/${created.id}`)
      .auth(apiToken, { type: 'bearer' })
      .send({ sessionStatus: 'finished' })
      .expect(200);

    return created.id as number;
  };

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

  it('should require authentication for upcoming sessions: /api/v1/reading-sessions/upcoming (GET)', () => {
    return request(app).get('/api/v1/reading-sessions/upcoming').expect(401);
  });

  it('should reject invalid upcoming query params: /api/v1/reading-sessions/upcoming (GET)', () => {
    return request(app)
      .get('/api/v1/reading-sessions/upcoming?withinHours=0&limit=0')
      .auth(apiToken, { type: 'bearer' })
      .expect(400);
  });

  it('should list upcoming approved sessions: /api/v1/reading-sessions/upcoming (GET)', async () => {
    const { body } = await request(app)
      .get('/api/v1/reading-sessions/upcoming?withinHours=24&limit=5')
      .auth(apiToken, { type: 'bearer' })
      .expect(200);

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toEqual({
      count: body.data.length,
      serverTime: expect.any(String),
    });

    for (const session of body.data) {
      expect(session).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          sessionStatus: 'approved',
          startedAt: expect.any(String),
          endedAt: expect.any(String),
          counterpart: expect.objectContaining({
            id: expect.any(Number),
            role: expect.anything(),
          }),
        }),
      );
    }
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

  it('should submit feedback for a finished session idempotently: /api/v1/reading-sessions/:id/feedback (POST)', async () => {
    const sessionId = await createFinishedSession(
      '2099-02-01T09:00:00.000Z',
      '2099-02-01T10:00:00.000Z',
    );

    const payload = {
      feelingRating: 3,
      satisfactionRating: 4,
      sessionContent: 'The session helped me.',
      huber: { rating: 5, content: 'Very thoughtful', skipped: false },
    };

    const { body: first } = await request(app)
      .post(`/api/v1/reading-sessions/${sessionId}/feedback`)
      .auth(apiToken, { type: 'bearer' })
      .send(payload)
      .expect(200);

    expect(first).toEqual(
      expect.objectContaining({
        feelingRating: 3,
        satisfactionRating: 4,
        sessionContent: 'The session helped me.',
        huberRating: 5,
        huberContent: 'Very thoughtful',
        huberFeedbackSkipped: false,
        feedbackSubmittedAt: expect.any(String),
      }),
    );

    const { body: second } = await request(app)
      .post(`/api/v1/reading-sessions/${sessionId}/feedback`)
      .auth(apiToken, { type: 'bearer' })
      .send(payload)
      .expect(200);

    expect(second.feedbackSubmittedAt).toBe(first.feedbackSubmittedAt);
  });

  it('should accept skipped Huber feedback and reject out-of-range ratings', async () => {
    const sessionId = await createFinishedSession(
      '2099-03-01T09:00:00.000Z',
      '2099-03-01T10:00:00.000Z',
    );

    await request(app)
      .post(`/api/v1/reading-sessions/${sessionId}/feedback`)
      .auth(apiToken, { type: 'bearer' })
      .send({
        feelingRating: 0,
        satisfactionRating: 5,
        huber: { skipped: true },
      })
      .expect(422);

    const { body } = await request(app)
      .post(`/api/v1/reading-sessions/${sessionId}/feedback`)
      .auth(apiToken, { type: 'bearer' })
      .send({
        feelingRating: 4,
        satisfactionRating: 3,
        huber: { skipped: true },
      })
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        huberFeedbackSkipped: true,
        huberRating: null,
        huberContent: null,
      }),
    );
  });
});

import request from 'supertest';
import { APP_URL } from '../utils/constants';

describe('Contest Report Module', () => {
  const app = APP_URL;
  let filename: string;

  it('should generate a contest report: /api/v1/contest-report/generate (POST)', async () => {
    const { body } = await request(app)
      .post('/api/v1/contest-report/generate')
      .send({})
      .expect(201);

    filename = body?.filename;
    expect(filename).toBeDefined();
  });

  it('should download the generated report: /api/v1/contest-report/download/:filename (GET)', () => {
    return request(app)
      .get(`/api/v1/contest-report/download/${filename}`)
      .expect(200);
  });

  it('should download the latest report: /api/v1/contest-report/download-latest (GET)', () => {
    return request(app)
      .get('/api/v1/contest-report/download-latest')
      .expect(200);
  });
});

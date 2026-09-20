import request from 'supertest';
import { APP_URL } from './constants';

export const login = (email: string, password: string): Promise<string> =>
  request(APP_URL)
    .post('/api/v1/auth/email/login')
    .send({ email, password })
    .then(({ body }) => body.token);

export const registerUser = async () => {
  const email = `e2e.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
  const password = 'secret';

  await request(APP_URL)
    .post('/api/v1/auth/email/register')
    .send({ email, password, firstName: 'E2E', lastName: 'Test' })
    .expect(204);

  const token = await login(email, password);

  const { body } = await request(APP_URL)
    .get('/api/v1/auth/me')
    .auth(token, { type: 'bearer' });

  return { email, password, token, user: body as Record<string, any> };
};

export const deleteStatus = [200, 204];

export const firstId = (body: any): number =>
  body.data?.[0]?.id ?? body[0]?.id ?? body?.id;

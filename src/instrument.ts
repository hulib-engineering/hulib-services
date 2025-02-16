// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (
  process.env.PROJECT_ENV === 'production' ||
  process.env.PROJECT_ENV === 'staging'
) {
  if (!process.env.SENTRY_DSN) {
    throw new Error('SENTRY_DSN is not set');
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    environment: process.env.PROJECT_ENV,
  });
}

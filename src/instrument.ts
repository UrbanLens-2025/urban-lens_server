/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
const dotenv = require('dotenv');
const Sentry = require('@sentry/nestjs');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

dotenv.config({ path: '.env.development' }); // load env temporarily

const dsn = process.env.SENTRY_DSN ?? null;

if (!dsn) {
  console.warn('SENTRY_DSN is not set. Sentry will not be initialized.');
}

Sentry.init({
  dsn,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
    // Sentry.postgresIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

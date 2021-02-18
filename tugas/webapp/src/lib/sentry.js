const Vue = require('vue').default;
const Sentry = require('@sentry/vue');
const { Integrations } = require('@sentry/tracing');

Sentry.init({
  Vue,
  dsn: process.env.SENTRY_DSN || '',
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

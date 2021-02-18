const Vue = require('vue').default;
const Sentry = require('@sentry/vue');
const { Integrations } = require('@sentry/tracing');

Sentry.init({
  Vue,
	logErrors: true,
	tracingOptions: {
    trackComponents: true,
  },
  dsn: process.env.SENTRY_DSN || '',
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

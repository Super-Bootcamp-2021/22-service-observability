import Vue from "vue";
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  Vue,
  dsn:"https://7da8f56bcf9f4acf92f95aac16c8e0cd@o526517.ingest.sentry.io/5642134" ,
  integrations: [new Integrations.BrowserTracing()],
  logErrors:true,
  
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control 
  tracesSampleRate: 1.0,
});
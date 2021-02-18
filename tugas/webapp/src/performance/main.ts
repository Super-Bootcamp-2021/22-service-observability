import Vue, { CreateElement, VNode } from 'vue';
import {
  summary,
  loadingMessage,
  errorMessage,
} from './components/performance-components';
import { store$ } from './store';
import { summary as summaryAction } from './async-action';
import './main.css';
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  Vue,
  dsn: process.env.SENTRY_DSN|| '',
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

const buttonRefresh = Vue.extend({
  render(createElement: CreateElement): VNode {
    return createElement('button', {
      attrs: {
        id: 'refresh',
      },
      domProps: {
        innerHTML: 'refresh',
      },
      on: {
        click: (event) => {
          store$.dispatch<any>(summaryAction);
        },
      },
    });
  },
});

const app1 = new Vue({
  el: '#performance',
  components: {
    loadingMessage: loadingMessage,
    errorMessage: errorMessage,
    buttonRefresh: buttonRefresh,
    performanceResult: summary,
  },
  render(h: CreateElement): VNode {
    return h('div', [
      h('hr'),
      h(loadingMessage, { props: { loading: this.performance.loading } }),
      h(errorMessage, { props: { error: this.performance.error } }),
      h(buttonRefresh),
      h(summary, { props: { result: this.performance.summary } }),
    ]);
  },
  data: {
    performance: {},
  },
  created() {
    this.performance = store$.getState();
  },
  mounted() {
    store$.subscribe(() => {
      this.performance = store$.getState();
    });
    store$.dispatch<any>(summaryAction);
  },
});

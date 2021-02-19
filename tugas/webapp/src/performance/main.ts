import Vue, { CreateElement, VNode } from 'vue';
import { navigation } from './components/navigation';
import { loadingMessage, errorMessage } from './components/message';
import { summary } from './components/performance';
import { store$ } from './store';
import { summary as summaryAction } from './async-action';
import './main.css';
import '../sentry';


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
    navigation: navigation,
    loadingMessage: loadingMessage,
    errorMessage: errorMessage,
    buttonRefresh: buttonRefresh,
    performSummary: summary,
  },
  render(h: CreateElement): VNode {
    return h('div', [
      h(navigation),
      h('hr'),
      h(loadingMessage, { props: { loading: this.performance.loading } }),
      h(errorMessage, { props: { error: this.performance.error } }),
      h(buttonRefresh),
      h(summary, { props: { details: this.performance.summary } }),
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

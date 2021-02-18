import Vue, { CreateElement, VNode } from 'vue';

import { Worker } from './Worker';

export const WorkerList = Vue.extend({
  props: ['workers'],
  components: {
    Worker: Worker,
  },
  render(createElement: CreateElement): VNode {
    let workers: VNode[] = [];

    for (const worker of this.$props.workers) {
      workers.push(createElement('Worker', { props: { worker } }));
    }

    return createElement('div', workers);
  },
});

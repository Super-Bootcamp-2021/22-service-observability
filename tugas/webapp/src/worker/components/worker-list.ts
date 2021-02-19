import Vue, { CreateElement, VNode } from 'vue';
import { remove } from '../async-action';
import { Worker } from '../reducer';
import { store$ } from '../store';

const WorkerList = Vue.extend({
  props: ['workers'],
  render(createElement: CreateElement): VNode {
    const workerList = this.$props.workers.map((w: Worker) => {
      return createElement('div', [
        createElement('img', {
          domProps: { src: w.photo, alt: '', width: '50', height: '50' },
        }),
        ' ',
        createElement('span', w.name),
        ' ',
        createElement(
          'button',
          { on: { click: () => this.deleteWorker(w.id) } },
          'hapus'
        ),
      ]);
    });
    return createElement('div', workerList);
  },
  methods: {
    deleteWorker(id) {
      store$.dispatch<any>(remove(id));
    },
  },
});

export default WorkerList;

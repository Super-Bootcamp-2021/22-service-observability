import Vue from 'vue';
import { remove } from '../async-action';
import { store$ } from '../store';

export const ListWorker = Vue.extend({
  props: ['workers'],
  render(element) {
    const workerList = this.$props.workers.map((worker) => {
      return element('div', [
        element('li', [
          element('img', {
            domProps: {
              src: worker.photo,
              alt: 'worker.jpg',
              width: '40',
              height: '40',
            },
          }),
          element('span', worker.name),
          element(
            'button',
            {
              on: {
                click: () => {
                  this.removeWorker(worker);
                },
              },
            },
            'hapus'
          ),
        ]),
      ]);
    });
    return element('ol', workerList);
  },

  methods: {
    removeWorker(worker) {
      store$.dispatch(remove(worker.id));
    },
  },
});

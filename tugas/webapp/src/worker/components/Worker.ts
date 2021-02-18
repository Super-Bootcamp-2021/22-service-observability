import Vue, { CreateElement, VNode } from 'vue';
import { remove } from '../async-action';
import { store$ } from '../store';

export const Worker = Vue.extend({
  props: ['worker'],
  render(createElement: CreateElement): VNode {
    let worker = createElement('div', [
      createElement('img', {
        attrs: {
          width: '30px',
          height: '30px',
          src: this.$props.worker.photo,
          alt: 'photo.jpg',
        },
      }),
      createElement('span', this.$props.worker.name),
      createElement(
        'button',
        {
          on: {
            click: this.removeWorker,
          },
        },
        'HAPUS'
      ),
    ]);
    return worker;
  },
  methods: {
    removeWorker(e) {
      const { id } = this.$props.worker;
      store$.dispatch<any>(remove(id));
    },
  },
});

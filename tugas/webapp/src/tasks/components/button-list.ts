import Vue, { CreateElement, VNode } from 'vue';
import { cancel, done } from '../async-action';
import { store$ } from '../store';

export const ButtonList = Vue.extend({
  props: ['task'],
  render(createElement: CreateElement): VNode {
      return createElement('span', [
        createElement(
          'button',
          {
            on: {
              click: () => {
                store$.dispatch<any>(cancel(this.$props.task.id));
              },
            },
          },
          'batal'
        ),
        createElement(
          'button',
          {
            on: {
              click: () => {
                store$.dispatch<any>(done(this.$props.task.id));
              },
            },
          },
          'selesai'
        ),
      ]);
  },
});

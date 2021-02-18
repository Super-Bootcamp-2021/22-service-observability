import Vue, { CreateElement, VNode } from 'vue';

export const summary = Vue.extend({
  props: ['details'],
  render(createElement: CreateElement): VNode {
    return createElement('ul', [
      createElement('li', [
        'jumlah pekerja :',
        createElement(
          'span',
          {
            attrs: {
              id: 'workers',
            },
          },
          this.$props.details.total_worker
        ),
      ]),
      createElement('li', [
        'jumlah tugas:',
        createElement(
          'span',
          {
            attrs: {
              id: 'tasks',
            },
          },
          this.$props.details.total_task
        ),
      ]),
      createElement('li', [
        'yang selesai:',
        createElement(
          'span',
          {
            attrs: {
              id: 'task-done',
            },
          },
          this.$props.details.task_done
        ),
      ]),
      createElement('li', [
        'yang diabtalkan:',
        createElement(
          'span',
          {
            attrs: {
              id: 'task-canceled',
            },
          },
          this.$props.details.task_cancelled
        ),
      ]),
    ]);
  },
});

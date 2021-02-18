import Vue, { CreateElement, VNode } from 'vue';

export const summary = Vue.extend({
  props: ['result'],
  render(createElement: CreateElement): VNode {
    return createElement('ul', [
      createElement('li', [
        'jumlah pekerja :',
        createElement(
          'span',
          {attrs: {id: 'workers'},
          },
          this.$props.result.total_worker
        ),
      ]),
      createElement('li', [
        'jumlah tugas:',
        createElement(
          'span',
          {attrs: {id: 'tasks',},
          },
          this.$props.result.total_task
        ),
      ]),
      createElement('li', [
        'yang selesai:',
        createElement(
          'span',
          {attrs: {id: 'task-done',},
          },
          this.$props.result.task_done
        ),
      ]),
      createElement('li', [
        'yang diabtalkan:',
        createElement(
          'span',
          {attrs: {id: 'task-canceled',},
          },
          this.$props.result.task_cancelled
        ),
      ]),
    ]);
  },
});

export const errorMessage = Vue.extend({
  props: ['error'],
  render(createElement: CreateElement): VNode {
    return createElement('p', {
      class: 'error',
      attrs: {id: 'error-text',
      },
      domProps: {
        innerHTML: this.$props.error ?? '',
      },
    });
  },
});

export const loadingMessage = Vue.extend({
  props: ['loading'],
  render(createElement: CreateElement): VNode {
    return createElement('p', {
      class: 'primary',
      attrs: {id: 'loading-text',
      },
      style: {
        display: this.$props.loading ? '' : 'none',
      },
      domProps: {
        innerHTML: 'memuat...',
      },
    });
  },
});
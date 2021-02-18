import Vue, { CreateElement, VNode } from 'vue';
import { TaskState } from '../reducer';
import { ButtonList } from './button-list';

export const Tasklist = Vue.extend({
  props: ['tasks'],
  components:{
    'button-list': ButtonList,
  },
  render(createElement: CreateElement): VNode {
    const tasklist = this.$props.tasks.map((task: TaskState) => {
      return createElement('div', [
        createElement(
          'a',
          {
            domProps: {
              href: task.attachment,
              target: '_blank',
            },
          },
          'lampiran'
        ),
        createElement('span', ` ${task.job} `),
        createElement('span', ` ${task.assignee} `),
        task.done
          ? createElement('span', 'Sudah selesai')
          : createElement('button-list', { props: { task: task } }),
      ]);
    });
    return createElement('ol', tasklist);
  }
});

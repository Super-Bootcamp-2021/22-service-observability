import Vue, { CreateElement, VNode } from 'vue';
import { cancel, done } from '../async-action';
import { Task } from '../reducer';
import { store$ } from '../store';

const TaskList = Vue.extend({
  props: ['tasks'],
  render(createElement: CreateElement): VNode {
    const taskList = this.$props.tasks.map((t: Task) => {
      return createElement('div', [
        createElement(
          'a',
          { domProps: { href: t.attachment, target: 'blank' } },
          'lampiran'
        ),
        ' ',
        createElement('span', t.job),
        ' - ',
        createElement('span', t.assignee),
        ' ',
        t.done
          ? createElement('span', 'sudah selesai')
          : createElement('span', [
              createElement(
                'button',
                { on: { click: () => this.doneTask(t.id) } },
                'selesai'
              ),
              createElement(
                'button',
                { on: { click: () => this.cancelTask(t.id) } },
                'batal'
              ),
            ]),
      ]);
    });
    return createElement('div', taskList);
  },
  methods: {
    doneTask(id) {
      store$.dispatch<any>(done(id));
    },
    cancelTask(id) {
      store$.dispatch<any>(cancel(id));
    },
  },
});

export default TaskList;

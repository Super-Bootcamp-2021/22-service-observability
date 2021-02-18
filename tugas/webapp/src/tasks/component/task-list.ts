import Vue, { CreateElement } from 'vue';
import { cancel, done } from '../async-action';
import { store$ } from '../store';

export const TaskList = Vue.extend({
  props: ['tasks'],
  render(createElement: CreateElement) {
    const TaskList = this.$props.tasks.map((task) => {
      if(task.done) {
        return createElement('div', [
          createElement('a', {
            domProps: {
              href: task.attachment,
              innerText: 'lampiran'
            }
          }),
          createElement('span', ' - '),
          createElement('span', task.job),
          createElement('span', ' - '),
          createElement('span', task.assignee),
          createElement('span', ' - '),
          createElement('span', 'sudah selesai')
        ]);
      } else {
        return createElement('div', [
          createElement('a', {
            domProps: {
              href: task.attachment,
              innerText: 'lampiran'
            }
          }),
          createElement('span', ' - '),
          createElement('span', task.job),
          createElement('span', ' - '),
          createElement('span', task.assignee),
          createElement('span', ' - '),
          createElement('button', {
            domProps: {
              innerText: 'batal'
            },
            on: {
              click: () => {
                this.taskCancel(task.id);
              }
            }
          }),
          createElement('button', {
            domProps: {
              innerText: 'selesai'
            },
            on: {
              click: () => {
                this.taskDone(task.id);
              }
            }
          }),
        ]);
      }
    })
    return createElement('div', TaskList)
  },
  methods: {
    taskDone(id) {
      store$.dispatch<any>(done(id));
    },
    taskCancel(id) {
      store$.dispatch<any>(cancel(id));
    }
  }
});
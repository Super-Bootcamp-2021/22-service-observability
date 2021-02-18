import Vue from 'vue';
import { cancel, done } from './async-action';
import { store$ } from './store';

export const TaskList = Vue.extend({
  props: ['tasks'],
  render(crt) {
    const tasklist = this.$props?.tasks?.map((task) => {
      return crt('div', [
        crt(
          'a',
          {
            domProps: {
              href: task.attachment,
              target: '_blank',
            },
          },
          'lampiran'
        ),
        crt('span', ` ${task.job} `),
        crt('span', ` ${task.assignee} `),
        task.done
          ? crt('span', 'Sudah selesai')
          : crt('span', [
              crt(
                'button',
                {
                  on: {
                    click: () => {
                      store$.dispatch(cancel(task.id));
                    },
                  },
                },
                'batal'
              ),
              crt(
                'button',
                {
                  on: {
                    click: () => {
                      store$.dispatch(done(task.id));
                    },
                  },
                },
                'selesai'
              ),
            ]),
      ]);
    });
    return crt('ol', tasklist);
  },
});

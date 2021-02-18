const Vue = require('vue').default;
const { cancel, done } = require('../async-action');
const { store$ } = require('../store');

const TaskList = Vue.extend({
  props: ['tasks'],
  render(createElement) {
    const taskList = this.$props.tasks.map((task) => {
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
        createElement('span', ` ${task.job}`),
        createElement('span', task.assignee),
        task.done
          ? createElement('span', ' sudah selesai')
          : [
              createElement(
                'button',
                {
                  on: {
                    click: () => {
                      this.doneTask(task.id);
                    },
                  },
                },
                'selesai'
              ),
              createElement(
                'button',
                {
                  on: {
                    click: () => {
                      this.cancelTask(task.id);
                    },
                  },
                },
                'batal'
              ),
            ],
      ]);
    });
    return createElement('div', taskList);
  },
  methods: {
    doneTask(id) {
      store$.dispatch(done(id));
    },
    cancelTask(id) {
      store$.dispatch(cancel(id));
    },
  },
});

module.exports = {
  TaskList,
};

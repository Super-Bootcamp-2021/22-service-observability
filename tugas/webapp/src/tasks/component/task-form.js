const Vue = require('vue').default;
const { add } = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');

const TaskForm = Vue.extend({
  props: ['tasks', 'workers'],
  render(createElement) {
    return createElement(
      'form',
      {
        //class: { 'todo-done': todo.done },
        on: {
          submit: this.registerNewTask,
        },
      },
      [
        createElement('label', 'Tugas:'),
        createElement('br'),
        createElement('textarea', {
          domProps: {
            name: 'tugas',
            cols: '30',
            rows: '3',
          },
          on: {
            input: (event) => {
              this.tugas = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', 'Pekerja:'),
        createElement('br'),
        createElement(
          'select',
          {
            on: {
              change: (event) => {
                this.pekerja =
                  event.target.children[event.target.selectedIndex].value;
              },
            },
          },
          [
            createElement(
              'option',
              {
                domProps: {
                  disabled: true,
                  selected: true,
                },
              },
              'Pilih nama pegawai'
            ),
            this.$props.workers.map((worker) => {
              return createElement(
                'option',
                {
                  domProps: {
                    value: worker.id,
                  },
                },
                worker.name
              );
            }),
          ]
        ),
        createElement('br'),
        createElement('label', 'Lampiran:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            type: 'file',
          },
          on: {
            change: (event) => {
              this.processFile(event);
            },
          },
        }),
        createElement('br'),
        createElement('button', 'Kirim', {
          domProps: {
            type: 'submit',
          },
        }),
      ]
    );
  },
  data: function () {
    return {
      tugas: '',
      lampiran: null,
      pekerja: '',
    };
  },
  methods: {
    processFile(event) {
      this.lampiran = event.target.files[0];
    },
    registerNewTask(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (!this.tugas || !this.lampiran || !this.pekerja) {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        return;
      }

      store$.dispatch(
        add({
          job: this.tugas,
          attachment: this.lampiran,
          assignee_id: this.pekerja,
        })
      );
      event.target.reset();
    },
  },
});

module.exports = {
  TaskForm,
};

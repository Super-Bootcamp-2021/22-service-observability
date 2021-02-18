import Vue from 'vue';
const { getList, add, getWorkersList } = require('./async-action');
const { store$, errorAction, clearErrorAction } = require('./store');
import { TaskList } from './task-list';
import './main.css';
import '../lib/sentry';

new Vue({
  el: '#app-1',
  components: {
    'task-list': TaskList,
  },
  render(crt) {
    return crt('div', [
      this.error ? crt('p', { class: { primary: true } }, this.error) : null,
      this.loading ? crt('p', { class: { primary: true } }, 'memuat...') : null,
      crt(
        'form',
        {
          on: {
            submit: this.submitNewTask,
          },
        },
        [
          crt(
            'label',
            {
              domProps: {
                name: 'tugas',
              },
            },
            'Tugas:'
          ),
          crt('br'),
          crt('textarea', {
            domProps: {
              placeholder: 'deskripsi',
              cols: 30,
              rows: 3,
            },
            on: {
              input: (event) => {
                this.job = event.target.value;
              },
            },
          }),
          crt('br'),
          crt(
            'label',
            {
              domProps: {
                name: 'Pekerja',
              },
            },
            'Pekerja:'
          ),
          crt('br'),
          crt(
            'select',
            {
              on: {
                change: (event) => {
                  this.assignee_id =
                    event.target.children[event.target.selectedIndex].value;
                },
              },
            },
            [
              this.assignee.map((worker) => {
                return crt(
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
          crt('br'),
          crt(
            'label',
            {
              attrs: {
                name: 'file',
              },
            },
            'Lampiran:'
          ),
          crt('br'),
          crt('input', {
            domProps: {
              type: 'file',
            },
            on: {
              change: (event) => {
                this.attachment = event.target.files[0];
              },
            },
          }),
          crt('br'),
          crt('button', 'kirim'),
        ]
      ),
      crt('h4', 'Daftar Pekerjaan'),
      crt('task-list', { props: { tasks: this.tasks } }),
    ]);
  },
  data: {
    loading: true,
    error: null,
    job: '',
    assignee: [],
    attachment: null,
    assignee_id: null,
    tasks: [],
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      if (!this.job || !this.assignee_id || !this.attachment) {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        return;
      }
      store$.dispatch(
        add({
          job: this.job,
          assignee_id: this.assignee_id,
          attachment: this.attachment,
        })
      );
      event.target.reset();
    },
  },

  mounted() {
    const state = store$.getState();
    this.loading = state.loading;
    this.error = state.error;
    this.assignee = state.workers;
    this.tasks = state.tasks;
    store$.subscribe(() => {
      const state = store$.getState();
      this.loading = state.loading;
      this.error = state.error;
      this.assignee = state.workers;
      this.tasks = state.tasks;
    });
    store$.dispatch(getList);
    store$.dispatch(getWorkersList);
  },
});

import Vue, { CreateElement, VNode } from 'vue';
import { add, getList, getWorkersList } from './async-action';
import { TaskList } from './component/task-list';
import { clearErrorAction, errorAction, store$ } from './store';
import './main.css';
import { captureMessage } from '@sentry/vue';
import '../lib/sentry';

new Vue({
  el: '#app',
  components: {
    'task-list': TaskList,
  },
  render(createElement: CreateElement) {
    const workers: VNode[] = [];
    workers.push(createElement('option', {
      domProps: {
        text: '---- Pilih Pekerja -----',
        selected: true,
        disabled: true,
      }
    }))
    for (const worker of this.workers) {
      workers.push(createElement('option', {
        domProps: {
          value: worker.id,
          text: worker.name,
        }
      }));
    }
    return createElement('div', [
      createElement('ul', [
        createElement('li', [
          createElement('a', {
            domProps: {
              href: 'worker.html',
              innerText: 'pekerja'
            }
          })
        ]),
        createElement('li', [
          createElement('a', {
            domProps: {
              href: 'tasks.html',
              innerText: 'pekerjaan'
            }
          })
        ]),
        createElement('li', [
          createElement('a', {
            domProps: {
              href: 'performance.html',
              innerText: 'kinerja'
            }
          })
        ]),
      ]),
      createElement('hr'),
      createElement('p', {
        class: 'error',
      }, this.error),
      createElement('p', {
        class: 'primary',
        style: {
          display: this.showLoading
        }
      }, 'memuat...'),
      createElement('form', {
        on: {
          submit: this.addNewTask,
        }
      }, [
        createElement('label', 'Tugas'),
        createElement('br'),
        createElement('textarea', {
          domProps: {
            cols: 30,
            rows: 3,
            placeholder: "deskripsi pekerjaan",
          },
          on: {
            change: (e) => {
              this.task.job = e.target.value;
            }
          }
        }),
        createElement('br'),
        createElement('label', 'Pekerja'),
        createElement('br'),
        createElement('select', {
          on: {
            change: (event) => {
              this.task.assignee = event.target.value
            }
          }
        }, workers),
        createElement('br'),
        createElement('label', 'Lampiran'),
        createElement('br'),
        createElement('input', {
          domProps: {
            type: 'file',
          },
          on: {
            input: (event) => {
              this.task.attachment = event.target.files;
            }
          }
        }),
        createElement('br'),
        createElement('button', 'kirim'),
        createElement('hr'),
        createElement('h4', 'Daftar Tugas'),
        createElement('task-list', { props: { tasks: this.tasks } }),
      ])
    ]);
  },
  data() {
    return {
      state: {},
      task: {
        job: '',
        assignee: '',
        attachment: [],
      },
      tasks: [],
      workers: [],
      showloading: '',
      error: '',
      errorText: 'gagal memuat daftar pekerjaan',
    }
  },
  mounted() {
    this.state = store$.getState();
    store$.subscribe(() => {
      this.state = store$.getState();
      this.tasks = this.state.tasks;
      this.workers = this.state.workers;
      this.loading();
      this.showError();
    })
    store$.dispatch<any>(getList);
    store$.dispatch<any>(getWorkersList);
  },
  methods: {
    loading() {
      if (this.state?.loading) {
        this.showLoading = '';
      } else {
        this.showLoading = 'none';
      }
    },
    showError() {
      if (this.state?.error) {
        this.error = this.state.error.toString();
        captureMessage('Error load tasks');
      } else {
        this.error = '';
      }
    },
    addNewTask(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());

      if (
        !this.task?.job ||
        !this.task?.assignee ||
        !this.task?.attachment[0]
      ) {
        store$.dispatch<any>(errorAction('form isian tidak lengkap!'));
        captureMessage('Failed add task');
        return;
      }

      if (this.task?.attachment[0]) {
        store$.dispatch<any>(
          add({
            job: this.task?.job,
            assignee_id: this.task?.assignee,
            attachment: this.task?.attachment[0]
          })
        );
      }

      event.target.reset();
      this.task.job = ''
      this.task.assignee = ''
      this.task.attachment = []
    }
  }
});
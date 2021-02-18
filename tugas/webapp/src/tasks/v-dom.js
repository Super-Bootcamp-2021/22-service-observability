const Vue = require('vue').default;

const { getList, getWorkersList } = require('./async-action');
require('./main.css');
const { store$ } = require('./store');

const { TaskForm } = require('./component/task-form');
const { TaskList } = require('./component/task-list');

require('../lib/sentry');

new Vue({
  el: '#task-app',
  components: {
    'task-form': TaskForm,
    'task-list': TaskList,
  },
  render(createElement) {
    return createElement('div', [
      createElement('p', {
        class: { error: 'error' },
        domProps: {
          innerText: this.error,
        },
      }),
      createElement('p', {
        class: { primary: 'primary' },
        style: { display: this.loading },
        domProps: {
          innerText: 'memuat...',
        },
      }),
      createElement('h4', 'Buat tugas baru'),
      createElement('task-form', {
        props: { workers: this.workers },
      }),
      createElement('hr'),
      createElement('h4', 'Daftar tugas'),
      createElement('task-list', {
        props: { tasks: this.tasks },
      }),
    ]);
  },
  data: function () {
    return {
      tasks: [],
      error: null,
      loading: 'none',
      workers: [],
    };
  },
  mounted() {
    let state;
    store$.subscribe(() => {
      state = store$.getState();
      this.tasks = state.tasks;
      this.error = state.error;
      this.workers = state.workers;

      if (state.loading) {
        this.loading = 'block';
      } else {
        this.loading = 'none';
      }
    });
    store$.dispatch(getList);
    store$.dispatch(getWorkersList);
    console.log(typeof state.loading);
  },
});

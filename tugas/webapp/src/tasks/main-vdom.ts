import './main.css';
import Vue, { CreateElement, VNode } from 'vue';
import { store$ } from './store';
import { getList, getWorkersList } from './async-action';
import { State } from './reducer';
import { Tasklist } from './components/task-list';
import { TaskInput } from './components/task-input';

new Vue({
  el: '#task-list',
  components: {
    'task-list': Tasklist,
    'task-input': TaskInput,
  },
  render(create: CreateElement): VNode {
    return create('div', [
      create('p', { class: ['error'] }, this.state.error),
      create(
        'p',
        {
          class: { primary: this.state.loading },
          style: { display: this.state.loading ? 'block' : 'none' },
        },
        'memuat...'
      ),
      create('task-input', { props: { workers: this.state.workers } }),
      create('hr'),
      create('div', [
        create('h4', 'daftar kerjaan'),
        create('task-list', { props: { tasks: this.state.tasks } }),
      ]),
    ]);
  },
  data: {
    state: <State>{
      loading: false,
      error: null,
      workers: [],
      tasks: [],
    },
  },
  mounted() {
    this.state = store$.getState();
    store$.subscribe(() => {
      this.state = store$.getState();
    });
    store$.dispatch<any>(getList);
    store$.dispatch<any>(getWorkersList);
  },
});

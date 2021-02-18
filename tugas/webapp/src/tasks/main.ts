import './main.css';
import { getList, getWorkersList } from './async-action';
import { store$ } from './store';

import Vue, { CreateElement, VNode } from 'vue';
import { TaskList } from './components/task-list';
import { FormTask } from './components/form-task';
import { navigation } from './components/navigation';

new Vue({
  el: '#task-app',
  components: {
    'task-list': TaskList,
    'form-task': FormTask,
    navigation: navigation,
  },
  render(createElement: CreateElement): VNode {
    return createElement('div', [
      createElement(navigation),
      createElement('hr'),
      this.state.error ? createElement('p', this.state.error.toString()) : null,
      this.state.loading ? createElement('p', 'memuat...') : null,
      createElement('h4', 'buat tugas baru'),
      createElement('form-task', { props: { state: this.state } }),
      createElement('hr'),
      createElement('h4', 'daftar tugas'),
      createElement('task-list', { props: { tasks: this.state.tasks } }),
    ]);
  },
  // data: {
  //   state: {},
  // },
  data: function () {
    return {
      state: {},
    };
  },
  // created() {
  mounted() {
    this.state = store$.getState();
    store$.subscribe(() => {
      this.state = store$.getState();
    });
    store$.dispatch<any>(getList);
    store$.dispatch<any>(getWorkersList);
  },
});

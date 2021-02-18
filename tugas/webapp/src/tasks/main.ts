/* eslint-disable  @typescript-eslint/no-explicit-any */
import Vue, { CreateElement, VNode } from 'vue';
import { getList, getWorkersList } from './async-action';
import { store$ } from './store';
import Navigation from './components/navigation';
import TaskList from './components/task-list';
import Form from './components/form';

import './main.css';

new Vue({
  el: '#task',
  components: {
    navigation: Navigation,
    'task-list': TaskList,
    'form-task': Form,
  },
  render(createElement: CreateElement): VNode {
    return createElement('div', [
      createElement('navigation'),
      createElement(
        'p',
        { domProps: { id: 'error-text' }, class: { error: true } },
        this.error
      ),
      this.loading
        ? createElement(
            'p',
            { domProps: { id: 'loading-text' }, class: { primary: true } },
            'memuat...'
          )
        : null,
      createElement('h4', 'Buat tugas baru'),
      createElement('form-task', { props: { workers: this.worker } }),
      createElement('hr'),
      createElement('h4', 'Daftar tugas'),
      createElement('task-list', { props: { tasks: this.task } }),
    ]);
  },
  data: {
    task: [],
    worker: [],
    error: '',
    loading: false,
  },
  mounted() {
    const state = store$.getState();
    this.task = state.tasks;
    this.worker = state.workers;
    this.loading = state.loading;
    this.error = state.error;
    store$.subscribe(() => {
      const state = store$.getState();
      this.task = state.tasks;
      this.worker = state.workers;
      this.loading = state.loading;
      this.error = state.error;
    });
    store$.dispatch<any>(getWorkersList);
    store$.dispatch<any>(getList);
  },
});

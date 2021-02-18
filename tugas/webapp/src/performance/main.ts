/* eslint-disable  @typescript-eslint/no-explicit-any */
import Vue, { CreateElement, VNode } from 'vue';
import Navigation from './components/navigation';
import { summary } from './async-action';
import { store$ } from './store';

import './main.css';

// const workers = document.getElementById('workers');
// const tasks = document.getElementById('tasks');
// const done = document.getElementById('task-done');
// const canceled = document.getElementById('task-canceled');
// const refresh = document.getElementById('refresh');
// const errorTxt = document.getElementById('error-text');
// const loadingTxt = document.getElementById('loading-text');

// presentation layer
// store$.subscribe(() => {
//   const state = store$.getState();
//   render(state);
// });
// const state = store$.getState();
// render(state);

// store$.dispatch<any>(summary);

// refresh.onclick = () => {
//   store$.dispatch<any>(summary);
// };

// function render(state: any) {
//   // render error
//   if (state.error) {
//     errorTxt.textContent = state.error.toString();
//   } else {
//     errorTxt.textContent = '';
//   }
//   if (state.loading) {
//     loadingTxt.style.display = 'block';
//   } else {
//     loadingTxt.style.display = 'none';
//   }

//   // render list of worker
//   workers.innerText = state.summary?.total_worker?.toString() ?? '0';
//   tasks.innerText = state.summary?.total_task?.toString() ?? '0';
//   done.innerText = state.summary?.task_done?.toString() ?? '0';
//   canceled.innerText = state.summary?.task_cancelled?.toString() ?? '0';
// }

new Vue({
  el: '#performance-app',
  components: {
    navigation: Navigation,
  },
  render(createElement: CreateElement): VNode {
    // const performance = this.summary(() => {
    //   return createElement('li');
    // });
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
      createElement(
        'button',
        { on: { click: () => store$.dispatch<any>(summary) } },
        'refresh'
      ),
      createElement('ul', [
        createElement('li', [
          createElement(
            'span',
            { domProps: { id: 'workers' } },
            'jumlah pekerja: ' + this.summary.total_worker
          ),
        ]),
        createElement('li', [
          createElement(
            'span',
            { domProps: { id: 'tasks' } },
            'jumlah tugas: ' + this.summary.total_task
          ),
        ]),
        createElement('li', [
          createElement(
            'span',
            { domProps: { id: 'task-done' } },
            'jumlah yang selesai: ' + this.summary.task_done
          ),
        ]),
        createElement('li', [
          createElement(
            'span',
            { domProps: { id: 'task-canceled' } },
            'yang dibatalkan: ' + this.summary.task_cancelled
          ),
        ]),
      ]),
    ]);
  },
  data: {
    summary: [],
    error: '',
    loading: false,
  },
  mounted() {
    const state = store$.getState();
    this.loading = state.loading;
    this.error = state.error;
    this.summary = state.summary;
    store$.subscribe(() => {
      const state = store$.getState();
      this.loading = state.loading;
      this.error = state.error;
      this.summary = state.summary;
      console.log(this.summary);
    });
    store$.dispatch<any>(summary);
  },
});

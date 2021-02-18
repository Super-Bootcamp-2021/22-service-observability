import './main.css';
import Vue from 'vue';
import { getList } from './async-action';
import { store$ } from './store';
import { ListWorker } from './components/worker-list';
import { AddWorker } from './components/worker-add';

new Vue({
  el: '#worker',
  components: {
    'worker-list': ListWorker,
    'worker-add': AddWorker,
  },
  render(element) {
    return element('div', [
      element('p', { class: { error: true } }, this.error),
      this.loading
        ? element('p', { class: { primary: true } }, 'memuat...')
        : null,
      element('h4', 'Daftarkan pekerja baru'),
      element('worker-add'),
      element('hr'),
      element('h4', 'Daftar Pekerja'),
      element('worker-list', { props: { workers: this.workers } }),
    ]);
  },

  data: {
    loading: false,
    error: null,
    workers: [],
  },

  mounted() {
    const state = store$.getState();
    this.loading = state.loading;
    this.error = state.error;
    this.workers = state.workers;
    store$.subscribe(() => {
      const state = store$.getState();
      this.loading = state.loading;
      this.error = state.error;
      this.workers = state.workers;
    });
    store$.dispatch(getList);
  },
});

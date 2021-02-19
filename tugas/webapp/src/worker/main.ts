import './main.css';
import '../lib/sentry';
import Vue, { CreateElement, VNode } from 'vue';
import { getList } from './async-action';
import { store$ } from './store';
import Navigation from './components/navigation';
import Form from './components/form';
import WorkerList from './components/worker-list';

new Vue({
  el: '#worker',
  components: {
    navigation: Navigation,
    'worker-list': WorkerList,
    'form-worker': Form,
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
      createElement('h4', 'Daftarkan pekerjaan baru'),
      createElement('form-worker'),
      createElement('hr'),
      createElement('h4', 'Daftar pekerja'),
      createElement('worker-list', { props: { workers: this.worker } }),
    ]);
  },
  data: {
    worker: [],
    error: '',
    loading: false,
  },
  mounted() {
    const state = store$.getState();
    this.worker = state.workers;
    this.loading = state.loading;
    this.error = state.error;
    store$.subscribe(() => {
      const state = store$.getState();
      this.worker = state.workers;
      this.loading = state.loading;
      this.error = state.error;
    });
    store$.dispatch<any>(getList);
  },
});

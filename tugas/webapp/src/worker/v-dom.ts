import { getList } from './async-action';
import { store$ } from './store';
import './main.css';
import Vue, { CreateElement, VNode } from 'vue';
import { Header } from './components/Header';
import { Form } from './components/Form';
import { WorkerList } from './components/workerList';
import { captureMessage } from '@sentry/vue';
import '../lib/sentry';
new Vue({
  el: '#app',
  components: {
    Header: Header,
    AddWorker: Form,
    WorkerList,
  },
  render(createEl: CreateElement): VNode {
    let header = createEl('Header');
    let form = createEl('AddWorker');
    let workers = createEl('WorkerList', { props: { workers: this.workers } });

    return createEl('div', [
      header,
      createEl(
        'p',
        {
          class: 'error',
        },
        this.error
      ),
      createEl(
        'p',
        {
          class: 'primary',
          style: {
            display: this.showLoading,
          },
        },
        'memuat...'
      ),
      form,
      workers,
    ]);
  },
  data() {
    return {
      state: {},
      workers: [],
      showloading: '',
      error: '',
      errorText: 'gagal memuat daftar pekerjaan',
    };
  },
  mounted() {
    store$.subscribe(() => {
      const state = store$.getState();
      this.workers = state.workers;
      this.state = state;
      this.loading();
      this.showError();
    });
    store$.dispatch<any>(getList);
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
        captureMessage('Error load worker');
      } else {
        this.error = '';
      }
    },
  },
});

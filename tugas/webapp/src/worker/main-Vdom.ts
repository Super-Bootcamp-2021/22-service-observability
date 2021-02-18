/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { register, getList, remove } from './async-action';
import { store$, errorAction, clearErrorAction } from './store';
import Vue, { CreateElement, VNode } from 'vue';
import { WorkerList } from './component/worker-list';
import { WorkerInput } from './component/worker-input';

export interface workerInterface {
  name: string;
  id: number;
  photo: string;
  bio: string;
}
new Vue({
  el: '#workerApp',
  components: {
    'worker-list': WorkerList,
    'worker-input': WorkerInput,
  },
  render(ce: CreateElement): VNode {
    return ce('div', [
      ce('div', [
        ce(
          'p',
          { class: 'error' },
          this.error !== null ? this.error.toString() : ''
        ),
        this.loading ? ce('p', { class: 'primary' }, 'memuat...') : null,
      ]),
      ce('div', [
        ce('h4', 'Daftarkan Pekerja Baru'),
        ce('worker-input', { props: { input: this.input } }),
      ]),
      ce('div', [
        ce('h4', 'Daftar Pekerja'),
        ce('worker-list', { props: { workers: this.workers } }),
      ]),
    ]);
  },
  data: {
    input: {
      name: '',
      age: 0,
      bio: '',
      address: '',
      photo: null,
    },
    workers: [],
    error: null,
    loading: false,
  },
  mounted() {
    this.workers = store$.getState().workers;
    this.error = store$.getState().error;
    this.loading = store$.getState().loading;
    store$.subscribe(() => {
      this.workers = store$.getState().workers;
      this.error = store$.getState().error;
      this.loading = store$.getState().loading;
    });
    store$.dispatch<any>(getList);
  },
});

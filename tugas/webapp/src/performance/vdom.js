require('./main.css');
import Vue from 'vue';
import { store$ } from './store';
import { summary } from './async-action';
import { captureMessage } from '@sentry/vue';
import '../lib/sentry';

new Vue({
  el: '#performance',
  render(CreateElement) {
    let summary = this.loadSumm?.summary; 
    return CreateElement('div', [
      CreateElement('ul', [
        CreateElement('li', [
          CreateElement(
            'a',
            {
              attrs: {
                href: 'worker.html',
              },
            },
            'pekerja'
          ),
        ]),
        CreateElement('li', [
          CreateElement(
            'a',
            {
              attrs: {
                href: 'tasks.html',
              },
            },
            'pekerjaan'
          ),
        ]),
        CreateElement('li', [
          CreateElement(
            'a',
            {
              attrs: {
                href: 'performance.html',
              },
            },
            'kinerja'
          ),
        ]),
      ]),
      CreateElement('hr'),
      CreateElement(
        'p',
        {
          class: { error: this.loadSumm?.error },
        },
        this.loadSumm?.error
      ),
      CreateElement(
        'p',
        {
          class: { primary: this.loadSumm?.loading },
        },
        this.loadSumm?.loading ? 'memuat . . .' : ''
      ),
      CreateElement(
        'button',
        {
          on: {
            click: this.state,
          },
        },
        'refresh'
      ),
      CreateElement('ul', [
        CreateElement('li', 'jumlah pekerja: ' + summary?.total_worker),
        CreateElement(
          'li',
          'jumlah tugas: ' + summary?.total_task
        ),
        CreateElement(
          'li',
          'yang selesai: ' + summary?.task_done
        ),
        CreateElement(
          'li',
          'yang dibatalkan: ' + summary?.task_cancelled
        ),
      ]),
    ]);
  },
  data: {
    loadSumm: {},
  },
  methods: {
    state() {
      store$.dispatch(summary);
    },
  },
  mounted() {
    this.loadSumm = store$.getState();
    store$.subscribe(() => {
      this.loadSumm = store$.getState();
    });
    store$.dispatch(summary);
  },
});

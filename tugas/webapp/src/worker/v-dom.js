/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
require('./main.css');
const Vue = require('vue').default;

//const { addTaskAsync, loadTasksAsync } = require('./worker.client');
const { WorkerList } = require('./components/worker-list');
const { WorkerForm } = require('./components/worker-form');
const { getList } = require('./async-action');
const { store$ } = require('./store');

new Vue({
  el: '#app-worker',
  components: {
    'worker-list': WorkerList,
    'worker-form': WorkerForm,
  },
  render(createElement) {    
    return createElement('div', [
      createElement('p', {        
        class: { error: 'error' },
        domProps: {
          innerText: this.error,
        }        
      }),
      createElement('p', {        
        class: { 'primary': 'primary' },
        style: { display: this.loading },
        domProps: {
          innerText: 'memuat...',
        }        
      }),
      createElement('h4', 'Daftarkan pekerja baru'),
      createElement('worker-form'),
      createElement('hr'),
      createElement('h4', 'Daftar pekerja'),      
      createElement('worker-list', { props: { workers: this.workers } }),      
    ]);
  },
  data: function () {
    return {    
      workers: [],
      error: null,
      loading: 'none'
    };
  },
  mounted() {
    let state;
    store$.subscribe(() => {
      state = store$.getState();
      this.workers = state.workers;
      this.error = state.error;
      //this.loading = state.loading;
      if(state.loading) {
        this.loading = 'block';
      } else {
        this.loading = 'none';      
      }
    });
        
    store$.dispatch(getList);
    console.log(typeof state.loading);
  
    
    
    // if (state.error) {
    //   errorTxt.textContent = state.error.toString();
    // } else {
    //   errorTxt.textContent = '';
    // }
  },
});

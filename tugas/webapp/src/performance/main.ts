import { summary } from './async-action';
import { store$ } from './store';
import './main.css';

const workers = document.getElementById('workers');
const tasks = document.getElementById('tasks');
const done = document.getElementById('task-done');
const canceled = document.getElementById('task-canceled');
const refresh = document.getElementById('refresh');
const errorTxt = document.getElementById('error-text');
const loadingTxt = document.getElementById('loading-text');

// if (errorTxt && loadingTxt && refresh && workers && tasks && done &&){

// }
// presentation layer
store$.subscribe(() => {
  const state = store$.getState();
  render(state);
});
const state = store$.getState();
render(state);

store$.dispatch<any>(summary);
if( refresh ) {
  refresh.onclick = () => {
    store$.dispatch<any>(summary);
  };
}

function render(state) {
  // render error
  if( errorTxt && loadingTxt ) {
    if (state.error) {
      errorTxt.textContent = state.error.toString();
    } else {
      errorTxt.textContent = '';
    }
    if (state.loading) {
      loadingTxt.style.display = '';
    } else {
      loadingTxt.style.display = 'none';
    }
  }

  // render list of worker
  if( workers && tasks && done && canceled ) {
    workers.innerText = state.summary.total_worker.toString();
    tasks.innerText = state.summary.total_task.toString();
    done.innerText = state.summary.task_done.toString();
    canceled.innerText = state.summary.task_cancelled.toString();
  }
}

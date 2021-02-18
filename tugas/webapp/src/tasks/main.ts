import {
  done,
  cancel,
  getList,
  add,
  getWorkersList,
} from './async-action';
import { store$, errorAction, clearErrorAction } from './store';

import './main.css';
import { State } from './reducer';
import { loading } from '../performance/reducer';

const form = document.getElementById('form') as HTMLFormElement;
const job = document.getElementById('job') as HTMLInputElement;
const assignee = document.getElementById('assignee') as HTMLSelectElement;
const attachment = document.getElementById('attachment') as HTMLInputElement;
const list = document.getElementById('list');
const errorTxt = document.getElementById('error-text');
const loadingTxt = document.getElementById('loading-text');

if(form&&job&&attachment){
  form.onsubmit = (event) => {
    event.preventDefault();
    store$.dispatch<any>(clearErrorAction());
    if (
      !job.value ||
      !assignee.options[assignee.selectedIndex] ||
      !attachment.files || !attachment.files[0]
    ) {
      store$.dispatch<any>(errorAction('form isian tidak lengkap!'));
      return;
    }
  const idnum = parseInt(assignee.options[assignee.selectedIndex].value)
    // register user
    store$.dispatch<any>(
      add({
        job: job.value,
        assignee_id: idnum,
        attachment: attachment.files[0],
      })
    );
  
    // reset form
    form.reset();
  };
  
}

// presentation layer
store$.subscribe(() => {
  const state = store$.getState();
  render(state);
});
const state = store$.getState();
render(state);

store$.dispatch<any>(getList);
store$.dispatch<any>(getWorkersList);

function render(state:State) {
  // render error
  if (state.error && errorTxt) {
    errorTxt.textContent = state.error.toString();
  } else if(errorTxt){
    errorTxt.textContent = '';
  }
  if (state.loading &&loadingTxt) {
    loadingTxt.style.display = '';
  } else if(loadingTxt){
    loadingTxt.style.display = 'none';
  }

  // add asignee options
  assignee.innerHTML = '';
  for (let i = 0; i < state.workers.length; i++) {
    const worker = state.workers[i];
    const option = document.createElement('option');
    option.text = worker.name;
    option.value = worker.id.toString();
    assignee.add(option);
  }

  // render list of worker
 if(list){
   list.innerHTML = '';
  for (let i = 0; i < state.tasks.length; i++) {
    console.log('dari render',state.tasks.length)
    const task = state.tasks[i];
    const li = document.createElement('div');
    let innerHtml = `
      <a href="${task.attachment}" target="_blank">lampiran</a>
      <span>${task.job}</span> -
      <span>${task.assignee}</span>
    `;
    if (task.done) {
      innerHtml += '\n<span>sudah selesai</span>';
      li.innerHTML = innerHtml;
    } else {
      const cancelBtn = document.createElement('button');
      cancelBtn.innerText = 'batal';
      cancelBtn.onclick = function () {
        store$.dispatch<any>(cancel(task.id));
      };
      const doneBtn = document.createElement('button');
      doneBtn.innerText = 'selesai';
      doneBtn.onclick = function () {
        store$.dispatch<any>(done(task.id));
      };
      li.innerHTML = innerHtml;
      li.append(cancelBtn, doneBtn);
    }
    list.append(li);
  }
 }
}

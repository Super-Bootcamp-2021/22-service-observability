import { register, getList, remove } from './async-action';
import { store$, errorAction, clearErrorAction } from './store';

import './main.css';

const form = document.getElementById('form') as HTMLFormElement;
const nameWorker = document.getElementById('name') as HTMLInputElement;
const age = document.getElementById('age') as HTMLInputElement;
const photo = document.getElementById('photo') as HTMLInputElement;
const bio = document.getElementById('bio') as HTMLInputElement;
const address = document.getElementById('address') as HTMLInputElement;
const list = document.getElementById('list');
const errorTxt = document.getElementById('error-text');
const loadingTxt = document.getElementById('loading-text');

if (form && age && photo && bio && address){
  form.onsubmit = (event): void => {
    event.preventDefault();
    store$.dispatch<any>(clearErrorAction());
    if (!nameWorker?.value || !age?.value || !photo?.files || !bio?.value ||!address?.value ) {
      store$.dispatch(errorAction('form isian tidak lengkap!'));
      return;
    }

    // register user
    store$.dispatch<any>(
      register({
        name: nameWorker?.value,
        photo: photo?.files[0],
        age: age?.value,
        bio: bio?.value,
        address: address?.value,
      })
    );

    // reset form
    form.reset();
  }
} else {

}
// presentation layer
store$.subscribe(() => {
  const state = store$.getState();
  render(state);
});
const state = store$.getState();
render(state);

store$.dispatch<any>(getList);

function render(state: any) {
  // render error
  if (errorTxt && loadingTxt) {
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
  if (list) {
    list.innerHTML = '';
    for (let i = 0; i < state.workers.length; i++) {
      const worker = state.workers[i];
      const li = document.createElement('div');
      const rmvBtn = document.createElement('button');
      rmvBtn.innerText = 'hapus';
      rmvBtn.onclick = function () {
        store$.dispatch<any>(remove(worker.id));
      };
      li.innerHTML = `
        <img src="${worker.photo}" alt="" width="30px" height="30px" />
        <span>${worker.name}</span>
      `;
      li.append(rmvBtn);
      list.append(li);
    }
  }
}

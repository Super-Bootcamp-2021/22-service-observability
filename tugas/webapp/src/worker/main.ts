import { register, getList, remove } from './async-action';
import { store$, errorAction, clearErrorAction } from './store';


import './main.css';
import '../sentry';

const form = <HTMLFormElement>document.getElementById('form');
const name = <HTMLInputElement>document.getElementById('name');
const age = <HTMLInputElement>document.getElementById('age');
const photo = <HTMLInputElement>document.getElementById('photo');
const bio = <HTMLInputElement>document.getElementById('bio');
const address = <HTMLInputElement>document.getElementById('address');
const list = <HTMLInputElement>document.getElementById('list');
const errorTxt = document.getElementById('error-text');
const loadingTxt = document.getElementById('loading-text');
if (form && name && photo && bio && address && age) {
  form.onsubmit = (event) => {
    event.preventDefault();
    store$.dispatch(clearErrorAction());
    if (
      !name.value ||
      !age.value ||
      !photo?.files ||
      !photo?.files[0]||
      !bio.value ||
      !address.value
    ) {
      store$.dispatch(errorAction('form isian tidak lengkap!'));
      return;
    }

    //register user
    store$.dispatch<any>(
      register({
        name: name.value,
        photo: photo?.files[0],
        age: age.value,
        bio: bio.value,
        address: address.value,
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

function render(state) {
  // render error
  if (errorTxt) {
    if (state.error) {
      errorTxt.textContent = state.error.toString();
    } else {
      errorTxt.textContent = '';
    }
  }

  if (loadingTxt) {
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

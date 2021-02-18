const Vue = require('vue').default;
const { register, getList, remove } = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');

const WorkerAdd = Vue.extend({
  render(createElement) {
    return createElement(
      'form',
      {
        on: {
          submit: this.submitNewWorker,
        },
      },
      [
        createElement('label', { attrs: { for: 'name' } }, 'Nama: '),
        createElement('br'),
        createElement('input', {
          domProps: {
            placeholder: 'misal Budiman',
          },
          on: {
            input: (event) => {
              this.addWorker.name = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', { attrs: { for: 'age' } }, 'Umur: '),
        createElement('br'),
        createElement('input', {
          attrs: {
            type: 'number',
            id: 'photo',
          },
          domProps: {
            placeholder: 'misal 23',
          },
          on: {
            input: (event) => {
              this.addWorker.age = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', { attrs: { for: 'photo' } }, 'Foto: '),
        createElement('br'),
        createElement('input', {
          attrs: {
            type: 'file',
            name: 'photo',
            id: 'photo',
          },
          on: {
            input: (event) => {
              this.addWorker.photo = event.target.files[0];
            },
          },
        }),
        createElement('br'),
        createElement('label', { attrs: { for: 'bio' } }, 'Biodata Singkat: '),
        createElement('br'),
        createElement('textarea', {
          attrs: {
            name: 'bio',
            id: 'bio',
            cols: '30',
            rows: '3',
            placeholder: 'biodata singkat pekerja',
          },
          on: {
            input: (event) => {
              this.addWorker.bio = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', { attrs: { for: 'address' } }, 'Alamat: '),
        createElement('br'),
        createElement('textarea', {
          attrs: {
            name: 'address',
            id: 'address',
            cols: '30',
            rows: '3',
            placeholder: 'Alamat pekerha',
          },
          on: {
            input: (event) => {
              this.addWorker.address = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('button', { attrs: { type: 'submit' } }, 'kirim'),
        createElement('br'),
      ]
    );
  },
  data() {
    return {
      addWorker: {
        name: '',
        age: 0,
        bio: '',
        address: '',
        photo: '',
      },
    };
  },
  methods: {
    submitNewWorker(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (
        this.addWorker.name &&
        this.addWorker.age &&
        this.addWorker.bio &&
        this.addWorker.address &&
        this.addWorker.photo
      ) {
        store$.dispatch(register(this.addWorker));
        event.target.reset();
      }
      store$.dispatch(errorAction('form isian tidak lengkap!'));
      return;
    },
  },
});

module.exports = {
  WorkerAdd,
};

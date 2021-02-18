const Vue = require('vue').default;
const { register } = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');

require('../../lib/sentry');

const WorkerForm = Vue.extend({
  props: ['workers'],
  render(createElement) {
    return createElement(
      'form',
      {
        //class: { 'todo-done': todo.done },
        on: {
          submit: this.registerNewWorker,
        },
      },
      [
        createElement('label', 'Nama:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            value: this.name,
          },
          on: {
            input: (event) => {
              this.name = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', 'Age:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            value: this.age,
          },
          on: {
            input: (event) => {
              this.age = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', 'Foto:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            type: 'file',
          },
          on: {
            change: (event) => {
              this.processFile(event);
            },
          },
        }),
        createElement('br'),
        createElement('label', 'Biodata singkat:'),
        createElement('br'),
        createElement('textarea', {
          domProps: {
            name: 'bio',
            cols: '30',
            rows: '3',
          },
          on: {
            input: (event) => {
              this.bio = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', 'Alamat:'),
        createElement('br'),
        createElement('textarea', {
          domProps: {
            name: 'bio',
            cols: '30',
            rows: '3',
          },
          on: {
            input: (event) => {
              this.address = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('button', 'Kirim', {
          domProps: {
            type: 'submit',
          },
        }),
      ]
    );
  },
  data: function () {
    return {
      name: '',
      photo: null,
      age: '',
      bio: '',
      address: '',
    };
  },
  methods: {
    processFile(event) {
      this.photo = event.target.files[0];
    },
    registerNewWorker(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (
        !this.name ||
        !this.photo ||
        !this.age ||
        !this.bio ||
        !this.address
      ) {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        return;
      }

      store$.dispatch(
        register({
          name: this.name,
          photo: this.photo,
          age: this.age,
          bio: this.bio,
          address: this.address,
        })
      );
      event.target.reset();
    },
  },
});

module.exports = {
  WorkerForm,
};

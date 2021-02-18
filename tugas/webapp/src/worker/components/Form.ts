import Vue, { CreateElement, VNode } from 'vue';
import { clearErrorAction, errorAction, store$ } from '../store';
import { register } from '../async-action';
import { captureMessage } from '@sentry/vue';
import '../../lib/sentry';

export const Form = Vue.extend({
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
  render(createElement: CreateElement): VNode {
    return createElement('div', [
      createElement(
        'form',
        {
          attrs: { method: 'post', id: 'form' },
          on: {
            submit: this.submitWorker,
          },
        },
        [
          createElement('label', { attrs: { for: 'name' } }, 'Nama:'),
          createElement('br'),
          createElement('input', {
            domProps: {
              value: this.addWorker.name,
            },
            attrs: {
              type: 'text',
              name: 'name',
              placeholder: 'misal budiman',
              id: 'name',
            },
            on: {
              input: (e) => {
                this.addWorker.name = e.target.value;
              },
            },
          }),
          createElement('br'),
          createElement('label', { attrs: { for: 'age' } }, 'Umur:'),
          createElement('br'),
          createElement('input', {
            attrs: {
              type: 'number',
              name: 'age',
              placeholder: 'misal 23',
              id: 'age',
            },
            domProps: {
              value: this.addWorker.age,
            },
            on: {
              input: (e) => {
                this.addWorker.age = e.target.value;
              },
            },
          }),
          createElement('br'),
          createElement('label', { attrs: { for: 'photo' } }, 'Foto:'),
          createElement('br'),
          createElement('input', {
            attrs: {
              type: 'file',
              name: 'photo',
              id: 'photo',
            },
            // domProps: {
            //   value: this.addWorker.photo,
            // },
            on: {
              input: (e) => {
                this.addWorker.photo = e.target.files[0];
              },
            },
          }),
          createElement('br'),
          createElement('label', { attrs: { for: 'bio' } }, 'Biodata Singkat:'),
          createElement('br'),
          createElement('textarea', {
            attrs: {
              name: 'bio',
              id: 'bio',
              cols: '30',
              rows: '3',
              placeholder: 'biodata singkat pekerja',
            },
            domProps: {
              value: this.addWorker.bio,
            },
            on: {
              input: (e) => {
                this.addWorker.bio = e.target.value;
              },
            },
          }),
          createElement('br'),
          createElement('label', { attrs: { for: 'address' } }, 'Alamat:'),
          createElement('br'),
          createElement('textarea', {
            attrs: {
              name: 'address',
              id: 'address',
              cols: '30',
              rows: '3',
              placeholder: 'alamat pekerja',
            },
            domProps: {
              value: this.addWorker.address,
            },
            on: {
              input: (e) => {
                this.addWorker.address = e.target.value;
              },
            },
          }),
          createElement('br'),
          createElement('button', { attrs: { type: 'submit' } }, 'kirim'),
          createElement('hr'),
        ]
      ),
    ]);
  },
  methods: {
    submitWorker(e) {
      e.preventDefault();
      store$.dispatch<any>(clearErrorAction());
      if (
        !this.addWorker.name ||
        !this.addWorker.age ||
        !this.addWorker.bio ||
        !this.addWorker.photo ||
        !this.addWorker.address
      ) {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        captureMessage('Failed add task');
        return;
      }
      console.log(this.addWorker);

      // register user
      store$.dispatch<any>(register(this.addWorker));

      // reset form
      e.target.reset();
      this.addWorker.name = '';
      this.addWorker.photo = '';
      this.addWorker.bio = '';
      this.addWorker.address = '';
      this.addWorker.age = 0;
    },
  },
});

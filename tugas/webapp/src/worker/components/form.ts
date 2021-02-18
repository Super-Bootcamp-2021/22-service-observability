import Vue, { CreateElement, VNode } from 'vue';
import { register } from '../async-action';
import { clearErrorAction, errorAction, store$ } from '../store';

const Form = Vue.extend({
  render(createElement: CreateElement): VNode {
    return createElement(
      'form',
      {
        on: {
          submit: this.submitNewTask,
        },
      },
      [
        createElement('label', { domProps: { for: 'name' } }, 'Nama:'),
        createElement('br'),
        createElement('input', {
          domProps: { name: 'name', placeholder: 'misal budiman' },
          on: {
            input: (event) => {
              this.name = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', { domProps: { for: 'age' } }, 'Umur:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            name: 'age',
            placeholder: 'misal budiman',
            type: 'number',
          },
          on: {
            input: (event) => {
              this.age = event.target.value;
            },
          },
        }),
        createElement('br'),
        createElement('label', { domProps: { for: 'photo' } }, 'Foto:'),
        createElement('br'),
        createElement('input', {
          domProps: {
            name: 'photo',
            type: 'file',
          },
          on: {
            change: (event) => {
              this.photo = event.target.files[0];
            },
          },
        }),
        createElement('br'),
        createElement(
          'label',
          {
            domProps: { for: 'bio' },
          },
          'Biodata singkat:'
        ),
        createElement('br'),
        createElement(
          'textarea',
          {
            domProps: {
              name: 'bio',
              cols: '30',
              rows: '3',
              placeholder: 'biodata singkat pekerja',
            },
            on: {
              input: (event) => {
                this.bio = event.target.value;
              },
            },
          },
          ''
        ),
        createElement('br'),
        createElement(
          'label',
          {
            domProps: { for: 'address' },
          },
          'Alamat:'
        ),
        createElement('br'),
        createElement(
          'textarea',
          {
            domProps: {
              name: 'address',
              cols: '30',
              rows: '3',
              placeholder: 'alamat pekerja',
            },
            on: {
              input: (event) => {
                this.address = event.target.value;
              },
            },
          },
          ''
        ),
        createElement('br'),
        createElement('button', 'kirim'),
      ]
    );
  },
  data: {
    name: '',
    photo: null,
    age: 0,
    bio: '',
    address: '',
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      store$.dispatch<any>(clearErrorAction());
      if (
        !this.name ||
        !this.age ||
        !this.photo ||
        !this.bio ||
        !this.address
      ) {
        store$.dispatch<any>(errorAction('form isian tidak lengkap!'));
        return;
      }

      // register user
      store$.dispatch<any>(
        register({
          name: this.name,
          photo: this.photo,
          age: this.age,
          bio: this.bio,
          address: this.address,
        })
      );

      this.name = '';
      this.photo = null;
      this.age = 0;
      this.bio = '';
      this.address = '';
      event.target.reset();
    },
  },
});

export default Form;

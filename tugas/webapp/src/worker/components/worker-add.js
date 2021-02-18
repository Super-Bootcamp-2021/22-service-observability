import Vue from 'vue';
import { register, getList, remove } from '../async-action';
import { store$, errorAction, clearErrorAction } from '../store';
import { captureMessage } from '@sentry/vue';

export const AddWorker = Vue.extend({
    render(element) {
      return element('div', [
        element('form', { on: { submit: this.addNewWorker } }, [
          element(
            'label',
            {
              domProps: {
                for: 'name',
              },
            },
            'Nama:'
          ),
          element('input', {
            domProps: {
              type: 'text',
              name: 'name',
              placeholder: 'misal budiman',
            },
            on: {
              input: (event) => {
                this.name = event.target.value;
              },
            },
          }),
          element('br'),
  
          element(
            'label',
            {
              domProps: {
                for: 'age',
              },
            },
            'Umur:'
          ),
          element('input', {
            domProps: {
              type: 'number',
              name: 'age',
              placeholder: 'misal 23',
            },
            on: {
              input: (event) => {
                this.age = event.target.value;
              },
            },
          }),
          element('br'),
  
          element(
            'label',
            {
              domProps: {
                for: 'photo',
              },
            },
            'Foto:'
          ),
          element('input', {
            domProps: {
              type: 'file',
              name: 'photo',
            },
            on: {
              change: (event) => {
                this.photo = event.target.files[0];
              },
            },
          }),
          element('br'),
          element(
            'label',
            {
              domProps: {
                for: 'bio',
              },
            },
            'Biodata singkat:'
          ),
          element('br'),
          element('textarea', {
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
          }),
          element('br'),
  
          element(
            'label',
            {
              domProps: {
                for: 'address',
              },
            },
            'Alamat:'
          ),
          element('br'),
          element('textarea', {
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
          }),
          element('br'),
          element('br'),
  
          element(
            'button',
            {
              domProps: {
                type: 'submit',
              },
            },
            'kirim'
          ),
        ]),
      ]);
    },
  
    data: {
      loading: false,
      error: null,
      name: '',
      age: '',
      photo: null,
      bio: '',
      address: '',
      workers: [],
    },
  
    methods: {
      addNewWorker(event) {
        event.preventDefault();
        store$.dispatch(clearErrorAction());
        if (
          !this.name ||
          !this.age ||
          !this.photo ||
          !this.bio ||
          !this.address
        ) {
          captureMessage('Worker failed added');
          store$.dispatch(errorAction('form isian tidak lengkap!'));
          return;
        }
  
        // register user
        store$.dispatch(
          register({
            name: this.name,
            photo: this.photo,
            age: this.age,
            bio: this.bio,
            address: this.address,
          })
        );
  
        this.name = '';
        this.age = '';
        this.photo = null;
        this.bio = '';
        this.address = '';
        event.target.reset();
      },
    },
  
    mounted() {
      const state = store$.getState();
      this.loading = state.loading;
      this.error = state.error;
      this.workers = state.workers;
      store$.subscribe(() => {
        const state = store$.getState();
        this.loading = state.loading;
        this.error = state.error;
        this.workers = state.workers;
      });
      store$.dispatch(getList);
    },
  });
  
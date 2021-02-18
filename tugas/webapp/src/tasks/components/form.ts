import Vue, { CreateElement, VNode } from 'vue';
import { add } from '../async-action';
import { clearErrorAction, errorAction, store$ } from '../store';

const Form = Vue.extend({
  props: ['workers'],
  render(createElement: CreateElement): VNode {
    const workerList = this.$props.workers.map((w: any) => {
      return createElement('option', { domProps: { value: w.id } }, w.name);
    });
    return createElement(
      'form',
      {
        on: {
          submit: this.submitNewTask,
        },
      },
      [
        createElement('label', { domProps: { for: 'job' } }, 'Tugas:'),
        createElement('br'),
        createElement(
          'textarea',
          {
            domProps: {
              name: 'job',
              cols: '30',
              rows: '3',
              placeholder: 'deskripsi pekerjaan',
            },
            on: {
              input: (event) => {
                this.job = event.target.value;
              },
            },
          },
          ''
        ),
        createElement('br'),
        createElement('label', { domProps: { for: 'assignee' } }, 'Pekerja:'),
        createElement('br'),
        createElement(
          'select',
          {
            domProps: {
              name: 'assignee',
            },
            on: {
              change: (event) => {
                this.assignee = event.target.value;
              },
            },
          },
          [
            createElement(
              'option',
              {
                domProps: { hidden: true, value: '' },
              },
              'silakan pilih'
            ),
            workerList,
          ]
        ),
        createElement('br'),
        createElement(
          'label',
          { domProps: { for: 'attachment' } },
          'Lampiran:'
        ),
        createElement('br'),
        createElement('input', {
          domProps: {
            name: 'attachment',
            type: 'file',
          },
          on: {
            change: (event) => {
              this.attachment = event.target.files[0];
            },
          },
        }),
        createElement('br'),
        createElement('button', 'kirim'),
      ]
    );
  },
  data: {
    job: '',
    attachment: null,
    assignee: null,
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (!this.job || !this.assignee || !this.attachment) {
        store$.dispatch<any>(errorAction('form isian tidak lengkap!'));
        return;
      }

      store$.dispatch<any>(
        add({
          job: this.job,
          assignee_id: this.assignee,
          attachment: this.attachment,
        })
      );
      this.job = '';
      this.attachment = null;
      this.assignee = null;
      event.target.reset();
    },
  },
});

export default Form;

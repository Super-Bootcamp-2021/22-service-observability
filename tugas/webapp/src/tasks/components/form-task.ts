import Vue, { CreateElement, VNode } from 'vue';
import { add } from '../async-action';
import { store$, errorAction, clearErrorAction } from '../store';
import { AssigneeSelect } from './assignee-select';

export const FormTask = Vue.extend({
  props: ['state'],
  components: {
    'assignee-select': AssigneeSelect,
  },
  render(createElement: CreateElement): VNode {
    return createElement(
      'form',
      {
        on: {
          submit: this.submitNewTask,
        },
      },
      [
        createElement(
          'label',
          {
            attrs: {
              for: 'job',
            },
          },
          'Tugas'
        ),
        createElement('textarea', {
          attrs: {
            name: 'job',
            id: 'job',
            cols: 30,
            rows: 3,
            placeholder: 'deskripsi pekerjaan',
          },
          // domProps: {
          //   value: this.job,
          // },
          on: {
            input: (event) => {
              this.job = event.target.value;
            },
          },
        }),
        createElement(
          'label',
          {
            attrs: {
              for: 'assignee',
            },
          },
          'Pekerja'
        ),
        createElement('assignee-select', {
          props: { workers: this.$props.state.workers },
          //   domProps: {
          //       value: this.assignee
          //   },
          on: {
            test: (event) => {
              this.assignee = event.target.value;
            },
          },
        }),
        createElement(
          'label',
          {
            attrs: {
              for: 'attachment',
            },
          },
          'Lampiran'
        ),
        createElement('input', {
          attrs: {
            type: 'file',
            name: 'attachment',
            id: 'attachment',
          },
          on: {
            input: (event) => {
              this.attachment = event.target.files[0];
            },
          },
        }),
        createElement('button', { attrs: { type: 'submit' } }, 'kirim'),
        // createElement(
        //   'button',
        //   {
        //     on: {
        //       click: this.submitNewTask,
        //     },
        //   },
        //   'kirim'
        // ),
      ]
    );
  },
  // data: {
  //   job: '',
  //   assignee: '',
  //   attachment: {},
  // },
  data: function () {
    return {
      job: '',
      assignee: '',
      attachment: {},
    };
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      // console.log(this.job, this.assignee, this.attachment);
      store$.dispatch(clearErrorAction());
      if (!this.job || !this.assignee || !this.attachment) {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        return;
      }

      // register user
      store$.dispatch<any>(
        add({
          job: this.job,
          assignee_id: this.assignee,
          attachment: this.attachment,
        })
      );

      // reset form
      event.target.reset();
    },
  },
});

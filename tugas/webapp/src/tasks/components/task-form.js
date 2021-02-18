/* eslint-disable no-unused-vars */
const Vue = require('vue').default;
const { CreateElement } = require('vue');
const {
  done,
  cancel,
  getList,
  add,
  getWorkersList,
} = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');
const { captureException } = require('@sentry/vue');

const TaskForm = Vue.extend({
  props: ['workers'],
  render(CreateElement) {
    const WorkerList = this.$props.workers.map((worker) => {
      return CreateElement(
        'option',
        {
          domProps: {
            value: worker.id,
          },
        },
        worker.name
      );
    });
    return CreateElement(
      'form',
      {
        on: {
          submit: this.submitTask,
        },
        style: {
          display: 'grid',
          gridTemplateColumns: '1 fr',
          width: '350px',
        },
      },
      [
        CreateElement('textarea', {
          domProps: {
            type: 'text',
            name: 'job',
            placeholder: 'masukkan detil tugas disini',
            rows: '5',
          },
          on: {
            input: (event) => {
              this.job = event.target.value;
            },
          },
          style: {
            marginBottom: '10px',
          },
        }),
        CreateElement(
          'select',
          {
            domProps: { name: 'assignee', value: '' },
            style: {
              marginBottom: '10px',
              width: '200px',
            },
            on: {
              click: (event) => {
                this.assignee_id =
                  event.target.options[event.target.selectedIndex].value;
                console.log(this.assignee_id);
              },
            },
          },
          WorkerList
        ),
        CreateElement('input', {
          domProps: {
            type: 'file',
            name: 'attachment',
          },
          on: {
            change: this.fileEvent,
          },
          style: {
            marginBottom: '15px',
          },
        }),
        CreateElement('input', {
          domProps: {
            type: 'submit',
            value: 'tambah tugas',
          },
        }),
      ]
    );
  },
  data: {
    job: '',
    assignee_id: '',
    attachment: '',
  },
  methods: {
    submitTask(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (!this.job && !this.assignee && !this.attachment) {
        captureException('form isian tidak lengkap!');
        store$.dispatch(errorAction('form isian tidak lengkap!'));
        return;
      }
      store$.dispatch(
        add({
          job: this.job,
          assignee_id: parseInt(this.assignee_id),
          attachment: this.attachment,
        })
      );
      event.target.reset();
    },
    fileEvent(event) {
      const attachment = event.target.files[0];
      this.attachment = attachment;
    },
  },
});

exports.TaskForm = TaskForm;

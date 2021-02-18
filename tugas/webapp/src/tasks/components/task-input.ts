import Vue, { CreateElement, VNode } from 'vue';
import { add } from '../async-action';
import { WorkerState } from '../reducer';
import { clearErrorAction, errorAction, store$ } from '../store';

export const TaskInput = Vue.extend({
  props: ['workers', 'input'],
  render(create: CreateElement): VNode {
    return create('div', [
      create(
        'form',
        {
          on: {
            submit: this.submitNewTask,
          },
        },
        [
          create('p', 'tugas:'),
          create(
            'textarea',
            {
              on: {
                input: (event) => {
                  this.input.job = event.target.value;
                },
              },
            },
            this.$props.input.job
          ),
          create('p', 'Assignee:'),
          create(
            'select',
            {
              on: {
                change: (event) => {
                  this.$props.input.assignee_id = event.target.value;
                },
              },
            },
            [
              create(
                'option',
                {
                  domProps: {
                    value: 0,
                  },
                },
                'Pilih nama pegawai'
              ),
              this.$props.workers.map((worker: WorkerState) => {
                return create(
                  'option',
                  {
                    domProps: {
                      value: worker.id,
                    },
                  },
                  worker.name
                );
              }),
            ]
          ),
          create('p', 'Lampiran:'),
          create(
            'input',
            {
              domProps: {
                type: 'file',
              },
              on: {
                input: (event) => {
                  this.$props.input.attachment = event.target.files[0];
                },
              },
            },
            this.$props.input.attachment
          ),
          create('br'),
          create('button', 'kirim'),
        ]
      ),
    ]);
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      store$.dispatch(clearErrorAction());
      if (
        this.$props.input.job &&
        this.$props.input.assignee_id !== 0 &&
        this.$props.input.attachment
      ) {
        store$.dispatch<any>(
          add({
            job: this.$props.input.job,
            assignee_id: this.$props.input.assignee_id,
            attachment: this.$props.input.attachment,
          })
        );
        event.target.reset();
      } else {
        store$.dispatch(errorAction('form isian tidak lengkap!'));
      }
    },
  },
});

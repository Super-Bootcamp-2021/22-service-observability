import Vue, { CreateElement, VNode } from 'vue';
import { add } from '../async-action';
import { WorkerState } from '../reducer';
import { store$ } from '../store';

export const TaskInput = Vue.extend({
  props: ['workers'],
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
          create('textarea', {
            on: {
              input: (event) => {
                this.job = event.target.value;
              },
            },
          }),
          create('p', 'Assignee:'),
          create(
            'select',
            {
              on: {
                change: (event) => {
                  this.assignee_id =
                    event.target.children[event.target.selectedIndex].value;
                },
              },
            },
            [
              create(
                'option',
                {
                  domProps: {
                    disabled: true,
                    selected: true,
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
          create('input', {
            domProps: {
              type: 'file',
            },
            on: {
              input: (event) => {
                this.attachment = event.target.files[0];
              },
            },
          }),
          create('br'),
          create('button', 'kirim'),
        ]
      ),
    ]);
  },
  data() {
    return {
      job: '',
      assignee_id: 0,
      attachment: null,
    };
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      store$.dispatch<any>(
        add({
          job: this.job,
          assignee_id: this.assignee_id,
          attachment: this.attachment,
        })
      );
      event.target.reset();
    },
  },
});

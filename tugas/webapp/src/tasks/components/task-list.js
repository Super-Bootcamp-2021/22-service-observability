/* eslint-disable no-unused-vars */
const Vue = require('vue').default;
const { CreateElement } = require('vue');
const { done, cancel } = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');
const TaskList = Vue.extend({
  props: ['tasks'],
  render(CreateElement) {
    const TaskItem = this.$props.tasks.map((task) => {
      return CreateElement('li', {}, [
        CreateElement(
          'a',
          {
            domProps: { href: task.attachment, target: '_blank' },
            style: {
              margin: '10px',
            },
          },
          'lampiran'
        ),
        CreateElement(
          'span',
          {
            style: {
              margin: '10px',
            },
          },
          task.job
        ),
        CreateElement(
          'span',
          {
            style: {
              marginRight: '10px',
            },
          },
          task.assignee
        ),
        CreateElement(
          'button',
          {
            on: {
              click: (event) => {
                store$.dispatch(cancel(task.id));
              },
            },
            style: {
              display: task.done ? 'none' : 'inherit',
            },
          },
          'batalkan'
        ),
        CreateElement(
          'button',
          {
            on: {
              click: (event) => {
                store$.dispatch(done(task.id));
              },
            },
            domProps: {
              innerText: task.done ? 'sudah selesai' : 'selesai',
            },
            attrs: {
              disabled: task.done ? true : false,
            },
          },
          'selesai'
        ),
      ]);
    });
    return CreateElement('ol', TaskItem);
  },
});

exports.TaskList = TaskList;

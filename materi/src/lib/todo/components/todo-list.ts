import Vue, { CreateElement, VNode } from 'vue';
import { Task } from '../reducer';
import { store$ } from '../store';
import { doneTaskAsync, undoneTaskAsync } from '../todo-client';

export const TodoList = Vue.extend({
  props: ['todos'],
  render(createElement: CreateElement): VNode {
    const todoList = this.$props.todos.map((todo: Task) => {
      return createElement(
        'li',
        {
          class: { 'todo-done': todo.done },
          on: {
            click: () => {
              this.toggleDone(todo);
            },
          },
        },
        todo.task
      );
    });
    return createElement('ol', todoList);
  },
  methods: {
    toggleDone(todo) {
      if (todo.done) {
        store$.dispatch<any>(undoneTaskAsync(todo.id));
      } else {
        store$.dispatch<any>(doneTaskAsync(todo.id));
      }
    },
  },
});

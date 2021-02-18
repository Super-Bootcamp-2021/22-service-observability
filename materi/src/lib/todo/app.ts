import './app.css';
import Vue, { CreateElement, VNode } from 'vue';
import { store$ } from './store';
import { addTaskAsync, loadTasksAsync } from './todo-client';
import { TodoList } from './components/todo-list';

new Vue({
  el: '#todo-app',
  components: {
    'todo-list': TodoList,
  },
  render(createElement: CreateElement): VNode {
    return createElement('div', [
      createElement(
        'form',
        {
          on: {
            submit: this.submitNewTask,
          },
        },
        [
          createElement('input', {
            domProps: {
              value: this.task,
            },
            on: {
              input: (event) => {
                this.task = event.target.value;
              },
            },
          }),
          createElement('button', 'tambah'),
        ]
      ),
      createElement('hr'),
      createElement('h4', 'daftar kerjaan'),
      createElement('todo-list', { props: { todos: this.todos } }),
    ]);
  },
  data: {
    task: '',
    todos: [],
  },
  methods: {
    submitNewTask(event) {
      event.preventDefault();
      if (!this.task?.length) {
        return;
      }
      store$.dispatch<any>(addTaskAsync(this.task));
      event.target.reset();
    },
  },
  mounted() {
    this.todos = store$.getState();
    store$.subscribe(() => {
      this.todos = store$.getState();
    });
    store$.dispatch<any>(loadTasksAsync);
  },
});

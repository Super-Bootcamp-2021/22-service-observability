require('./main.css');
const Vue = require('vue').default;
const { store$ } = require('./store');
const { summary } = require('./async-action');
const { menuLayout } = require('./components/menu');
const { errLoadBtn } = require('./components/errLoad');
const { listItem } = require('./components/todo-performance');

new Vue({
  el: '#performance-VDOM',
  components: {
    menuOption: menuLayout,
    errLoad: errLoadBtn,
    item: listItem,
  },
  render(createElement) {
    return createElement('div', [
      createElement('menuOption'),
      createElement('errLoad', {
        props: {
          err: this.state.error,
          load: this.state.loading,
        },
      }),
      createElement('item', {
        props: { summary: this.state.summary },
      }),
    ]);
  },
  data: {
    state: {},
  },
  mounted() {
    this.state = store$.getState();
    store$.subscribe(() => {
      this.state = store$.getState();
    });
    store$.dispatch(summary);
  },
});

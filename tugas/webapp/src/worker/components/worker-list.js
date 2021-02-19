const Vue = require('vue').default;
const { register, getList, remove } = require('../async-action');
const { store$, errorAction, clearErrorAction } = require('../store');

const WorkerList = Vue.extend({
  props: ['workers'],
  render(createElement) {
    const workerList = this.$props.workers?.map((worker) => {
      return createElement('div', [
        createElement('img', {
          attrs: {
            src: worker.photo,
            alt: '',
            width: '30px',
            height: '30px',
          },
        }),
        createElement('span', worker.name),
        createElement(
          'button',
          {
            on: {
              click: () => {
                this.toggleHapus(worker);
              },
            },
          },
          'hapus'
        ),
      ]);
    });
    return createElement('div', workerList);
  },
  methods: {
    toggleHapus(worker) {
      store$.dispatch(remove(worker.id));
    },
  },
});

module.exports = {
  WorkerList,
};

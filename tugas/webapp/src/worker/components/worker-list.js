const Vue = require('vue').default;

const { store$ } = require('../store');
const { remove } = require('../async-action');

require('../../lib/sentry');

const WorkerList = Vue.extend({
  props: ['workers'],
  render(createElement) {
    const workerList = this.$props.workers.map((worker) => {
      return createElement('div', [
        createElement('img', {
          domProps: {
            src: worker.photo,
            width: '30',
            height: '30',
          },
        }),
        createElement('span', worker.name),
        createElement('button', {
          domProps: {
            innerText: 'hapus',
          },
          on: {
            click: () => {
              console.log(worker.id);
              store$.dispatch(remove(worker.id));
            },
          },
        }),
      ]);
    });
    return createElement('div', workerList);
  },
});

module.exports = {
  WorkerList,
};

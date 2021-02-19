const Vue = require('vue').default;

const PerfComp = Vue.extend({
  props: ['summary'],
  render(createElement) {
    return createElement('ul', [
      createElement('li', [
        'jumlah pekerja: ',
        createElement('span', this.$props.summary?.total_worker.toString()),
      ]),
      createElement('li', [
        'jumlah tugas: ',
        createElement('span', this.$props.summary?.total_task.toString()),
      ]),
      createElement('li', [
        'yang selesai: ',
        createElement('span', this.$props.summary?.task_done.toString()),
      ]),
      createElement('li', [
        'yang dibatalkan: ',
        createElement('span', this.$props.summary?.task_cancelled.toString()),
      ]),
    ]);
  },
});

module.exports = {
  PerfComp,
};

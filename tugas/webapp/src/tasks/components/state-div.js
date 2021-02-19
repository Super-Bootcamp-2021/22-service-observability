const Vue = require('vue').default;
const { store$ } = require('../store');
const { getList, getWorkersList } = require('../async-action');

const StateComp = Vue.extend({
  props: ['errMsg', 'load'],
  render(createElement) {
    let hide;
    if (this.$props.load) {
      hide = '';
    } else {
      hide = 'none';
    }
    return createElement('div', [
      createElement(
        'p',
        {
          class: {
            error: true,
          },
        },
        this.$props.errMsg
      ),
      createElement(
        'p',
        {
          class: {
            primary: true,
          },
          style: {
            display: hide,
          },
        },
        'memuat...'
      ),
      createElement(
        'button',
        {
          on: {
            click: () => {
              store$.dispatch(getList);
              store$.dispatch(getWorkersList);
            },
          },
        },
        'refresh'
      ),
    ]);
  },
});

module.exports = {
  StateComp,
};

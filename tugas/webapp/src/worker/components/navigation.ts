import Vue, { CreateElement, VNode } from 'vue';

const Navigation = Vue.extend({
  render(createElement: CreateElement): VNode {
    return createElement('div', [
      createElement('ul', [
        createElement('li', [
          createElement('a', { domProps: { href: 'worker.html' } }, 'pekerja'),
        ]),
        createElement('li', [
          createElement('a', { domProps: { href: 'tasks.html' } }, 'pekerjaan'),
        ]),
        createElement('li', [
          createElement(
            'a',
            { domProps: { href: 'performance.html' } },
            'kinerja'
          ),
        ]),
      ]),
      createElement('hr'),
    ]);
  },
});

export default Navigation;

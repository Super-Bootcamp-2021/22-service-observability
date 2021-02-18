import Vue, { CreateElement, VNode } from 'vue';

export const Header = Vue.extend({
  render(createElement: CreateElement): VNode {
    let header = createElement('div', [
      createElement('ul', [
        createElement('li', [
          createElement('a', { attrs: { href: 'worker.html' } }, 'pekerja'),
        ]),
        createElement('li', [
          createElement('a', { attrs: { href: 'tasks.html' } }, 'pekerjaan'),
        ]),
        createElement('li', [
          createElement(
            'a',
            { attrs: { href: 'performance.html' } },
            'kinerja'
          ),
        ]),
      ]),
      createElement('hr'),
      createElement('h4', 'Daftarkan Pekerja Baru'),
    ]);
    return header;
  },
});

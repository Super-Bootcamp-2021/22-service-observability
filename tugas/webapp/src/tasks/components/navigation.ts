import Vue, { CreateElement, VNode } from 'vue';

export const navigation = Vue.extend({
  render(createElement: CreateElement): VNode {
    return createElement('ul', [
      createElement('li', [
        createElement('a', { attrs: { href: 'worker.html' } }, 'pekerja'),
      ]),
      createElement('li', [
        createElement('a', { attrs: { href: 'tasks.html' } }, 'pekerjaan'),
      ]),
      createElement('li', [
        createElement('a', { attrs: { href: 'performance.html' } }, 'kinerja'),
      ]),
    ]);
  },
});

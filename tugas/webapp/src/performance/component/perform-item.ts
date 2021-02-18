import Vue, { CreateElement, VNode } from 'vue';

export const PerformanceItem = Vue.extend({
  props: ['performance'],
  render(createElement: CreateElement): VNode {
    return createElement(
      'li',
      this.$props.performance.text + ":" + this.$props.performance.value
    );
  },
});

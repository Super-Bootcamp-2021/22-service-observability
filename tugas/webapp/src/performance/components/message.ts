import Vue, { CreateElement, VNode } from 'vue';

export const errorMessage = Vue.extend({
  props: ['error'],
  render(createElement: CreateElement): VNode {
    return createElement('p', {
      class: 'error',
      attrs: {
        id: 'error-text',
      },
      domProps: {
        innerHTML: this.$props.error ?? '',
      },
    });
  },
});

export const loadingMessage = Vue.extend({
  props: ['loading'],
  render(createElement: CreateElement): VNode {
    return createElement('p', {
      class: 'primary',
      attrs: {
        id: 'loading-text',
      },
      style: {
        display: this.$props.loading ? '' : 'none',
      },
      domProps: {
        innerHTML: 'memuat...',
      },
    });
  },
});

/* eslint-disable no-shadow */
import Vue from 'vue';

export default ({ store }) => {
  const loader = {
    install(Vue) {
      Vue.prototype.$loader = {
        show() {
          store.dispatch('common/setLoaderStatus', true);
        },
        hide() {
          store.dispatch('common/setLoaderStatus', false);
        },
      };
    },
  };
  if (process.browser) {
    Vue.use(loader);
  }
};

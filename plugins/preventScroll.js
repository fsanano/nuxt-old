/* eslint-disable no-shadow */
import Vue from 'vue';

export default ({ store }) => {
  const preventScroll = {
    install() {
      Vue.prototype.$preventScroll = {
        /**
         * Disable scroll prevent
         */
        disable() {
          store.dispatch('common/setScrollStatus', false);
        },
        /**
         * Enable scroll prevent
         */
        enable() {
          store.dispatch('common/setScrollStatus', true);
        },
      };
    },
  };

  if (process.browser) {
    Vue.use(preventScroll);
  }
};

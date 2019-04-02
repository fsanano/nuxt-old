/**
 *
 *
 * DEPRECATED. USE helpers/localStorage.js INSTEAD.
 * IN VUE USE this.$localStorage.
 * IN SSR USE app.localStorage
 *
 *
 */
const lStorage = process.browser
  ? window.localStorage
  : null;

const locStor = {
  set(key, val) {
    if (lStorage) {
      lStorage.setItem(`icex-${key}`, val);
    }
  },
  get(key) {
    if (lStorage) {
      return lStorage.getItem(`icex-${key}`);
    }
    return null;
  },
};

export default locStor;

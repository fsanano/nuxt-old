/* eslint-disable no-shadow */
import Vue from 'vue';
import Raven from 'raven-js';
import MobileDetect from 'mobile-detect';
import ls from '~/helpers/localStorage';
import { currencies } from '~/api';
import get from 'lodash.get';
import merge from 'lodash.merge';

const SET_USER_LOCALE = 'COMMON/SET_USER_LOCALE';
const SET_USER_DEVICE = 'COMMON/SET_USER_DEVICE';
const SET_USER_THEME = 'COMMON/SET_USER_THEME';
const SET_USER_MENU_SIZE = 'COMMON/SET_USER_MENU_SIZE';
const SET_USER_CURRENCY = 'COMMON/SET_USER_CURRENCY';
const SET_USER_DATA_VIEW = 'COMMON/SET_USER_DATA_VIEW';
const SET_LOADER_STATUS = 'COMMON/SET_LOADER_STATUS';
const SET_SCROLL_STATUS = 'COMMON/SET_SCROLL_STATUS';
const SET_CURRENCIES_LIST = 'COMMON/SET_CURRENCIES_LIST';
const SET_SOCKET_STATUS = 'COMMON/SET_SOCKET_STATUS';
const SET_BROWSER_CHECK = 'COMMON/SET_BROWSER_CHECK';

const state = () => ({
  version: process.env.GIT_HASH,
  currencies: {},
  currency: 'usd',
  isMobile: false,
  forceBrowserCheck: false,

  /**
   * Socket connection status
   * 0 - default value
   * 1 - connection error
   * 2 - successful connection
   */
  socketStatus: 0,
  // TODO: move locales into glossary
  locales: {
    en: {
      full: 'English',
      short: 'Eng',
      desc: 'eng',
    },
    ru: {
      full: 'Русский',
      short: 'Rus',
      desc: 'rus',
    },
    // ko: {
    //   full: '한국어',
    //   short: '한',
    //   desc: 'kor',
    // },
  },
  locale: 'en',
  menu: 'min',
  theme: 'light',
  showLoader: true,
  scrollDisabled: false,
  data: {
    view: '',
  },
  // in milliseconds
  // TODO: move ticks into glossary
  ticks: {
    minute: 60000,
    five_minutes: 300000,
    hour: 3600000,
    day: 86400000,
    week: 604800000,
    month: 2678400000,
  },
  /**
   * IMPORTANT NOTE: ALL VALUES IN GLOSSARY ARE STATIC
   * AND MUST NOT BE MUTATED
   */
  glossary: {
    colors: [
      '#01cf26',
      '#ff168e',
      '#6de95a',
      '#ff6da5',
      '#2ae9ad',
      '#b76da0',
      '#f0cd17',
      '#ff8a81',
      '#9cae8a',
      '#bf732c',
      '#d9cfa4',
    ],
  },
});

const getters = {
  currencySign: state => get(state.currencies, `${state.currency.toUpperCase()}.sign`, ''),
};

const actions = {
  async fetchCurrenciesList({ commit }, params) {
    const { data } = await currencies().fetchAll(params);

    if (data.result) {
      const result = data.data.reduce((acc, el) => {
        acc[el.short] = el;
        return acc;
      }, {});

      commit(SET_CURRENCIES_LIST, result);
    }

    return data;
  },
  /**
   *
   * @param commit
   * @param event
   * @return {Object}
   */
  setExchangeRates({ commit }, event) {
    const d = JSON.parse(event);

    const result = Object.keys(d).reduce((acc, el) => {
      acc[el] = { value: 1 * d[el] };
      return acc;
    }, {});

    commit(SET_CURRENCIES_LIST, result);

    return d;
  },
  setUserLocale({ commit }, locale) {
    commit(SET_USER_LOCALE, locale);
    Raven.setTagsContext({
      locale,
    });
  },
  setBrowserCheck({ commit }, flag) {
    commit(SET_BROWSER_CHECK, flag);
    Raven.setTagsContext({
      'browser.isOld': flag,
    });
  },
  setUserDevice({ commit }, flag) {
    commit(SET_USER_DEVICE, flag);
  },
  setUserTheme({ commit }, theme) {
    commit(SET_USER_THEME, theme);
    Raven.setTagsContext({
      theme,
    });
  },
  setUserMenuSize({ commit }, size) {
    // min || max
    commit(SET_USER_MENU_SIZE, size);
  },
  setUserCurrency({ commit }, currency) {
    commit(SET_USER_CURRENCY, currency);
    Raven.setTagsContext({
      currency,
    });
  },
  setUserDataView({ commit }, params) {
    commit(SET_USER_DATA_VIEW, params);
  },
  setUserDefaultParams({ commit, state }) {
    const md = new MobileDetect(window.navigator.userAgent);
    const initialUserParams = {
      theme: ls.getItem('theme').data || state.theme,
      menu: ls.getItem('menu').data || state.menu,
      view: ls.getItem('view').data || state.data.view,
      isMobile: (!!md.phone() || !!md.tablet()),
      locale: state.locale || ls.getItem('locale').data
      || window.navigator.language.split('-')[0]
      || window.navigator.userLanguage.split('-')[0],
    };

    commit(SET_USER_LOCALE, initialUserParams.locale);
    commit(SET_USER_DEVICE, initialUserParams.isMobile);
    commit(SET_USER_THEME, initialUserParams.theme);
    commit(SET_USER_MENU_SIZE, initialUserParams.menu);
    commit(SET_USER_DATA_VIEW, [initialUserParams.view, false]);
  },
  setLoaderStatus({ commit }, status) {
    commit(SET_LOADER_STATUS, status);
  },
  setSocketStatus({ commit }, status) {
    commit(SET_SOCKET_STATUS, status);
  },
  setScrollStatus({ commit }, status) {
    commit(SET_SCROLL_STATUS, status);
  },
};

const mutations = {
  [SET_USER_LOCALE](state, locale) {
    state.locale = locale;
    ls.setItem('locale', locale);
  },
  [SET_USER_DEVICE](state, flag) {
    state.isMobile = flag;
  },
  [SET_USER_THEME](state, theme) {
    state.theme = theme;
    ls.setItem('theme', theme);
  },
  [SET_USER_MENU_SIZE](state, size) {
    state.menu = size;
  },
  [SET_USER_CURRENCY](state, currency) {
    state.currency = currency;
    ls.setItem('currency', currency);
  },
  [SET_USER_DATA_VIEW](state, params) {
    const view = ls.getItem('view').data || params[0];
    const userView = params[0];
    const withSave = params[1];

    if (withSave) {
      ls.setItem('view', userView);
      Vue.set(state.data, 'view', userView);
    } else {
      Vue.set(state.data, 'view', view);
    }
  },
  [SET_LOADER_STATUS](state, status) {
    state.showLoader = status;
  },

  [SET_SOCKET_STATUS](state, status) {
    state.socketStatus = status;
  },

  [SET_SCROLL_STATUS](state, status) {
    state.scrollDisabled = status;
  },

  [SET_BROWSER_CHECK](state, flag) {
    state.forceBrowserCheck = flag;
  },

  [SET_CURRENCIES_LIST](state, list) {
    state.currencies = merge({}, state.currencies, list);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

/* eslint-disable no-shadow */
import Vue from 'vue'; // eslint-disable-line
import ls from '~/helpers/localStorage';
import { coins, coin } from '../api';

const localStorageKeys = {
  fav: 'icex-fav-coins',
};

/**
 * Check if exist active coins in Local Storage
 * @return {[type]} [description]
 */
function checkActiveCoins() {
  const coinsExist = ls.getItem('selectedCoins').data;
  return coinsExist ? coinsExist.split(',') : [];
}

const state = () => ({
  grid: [],
  data: {},
  fav: [],
  filters: [],
  exchange: {},
  list: {
    all: [],
    top: [],
  },
  sorting: 'name',
  selectedCoins: [],
});

const SET_COINS_LIST = 'COINS/SET_COINS_LIST';
const SET_TOP_COINS_LIST = 'COINS/SET_TOP_COINS_LIST';
const SET_COIN_DATA = 'COINS/SET_COIN_DATA';
const SET_COIN_EXCHANGE = 'COINS/SET_COIN_EXCHANGE';
const ADD_COIN_TO_EXCHANGE = 'COINS/ADD_COIN_TO_EXCHANGE';
const SET_SORTING = 'COINS/SET_SORTING';
const ADD_FAV_COIN = 'COINS/ADD_FAV_COIN';
const REMOVE_FAV_COIN = 'COINS/REMOVE_FAV_COIN';
const ADD_ACTIVE_COIN = 'COINS/ADD_ACTIVE_COIN';
const REMOVE_ACTIVE_COIN = 'COINS/REMOVE_ACTIVE_COIN';
const RESET_ACTIVE_COIN = 'COINS/RESET_ACTIVE_COIN';
const ADD_FILTER = 'COINS/ADD_FILTER';
const REMOVE_FILTER = 'COINS/REMOVE_FILTER';

const SET_GRID_COIN = 'SET_GRID_COIN';
const REMOVE_GRID_COIN = 'REMOVE_GRID_COIN';
const CLEAR_GRID_COINS = 'CLEAR_GRID_COINS';

const getters = {
  mainCoin: state => state.grid[0],
  additionalCoins: state => (state.grid.length > 0
    ? state.grid.slice(1)
    : []),
  sortCriteria: state => ls.getItem('sortCriteria').data || state.sorting,
};

const actions = {
  /**
   * Fetch all crypto coins list
   * @param  {Object} params         [request params]
   * @return {Array}                 [coins list]
   */
  async fetchCoinsList({ commit }, params) {
    const response = await coins().fetchAll(params);

    if (response.data.result) {
      commit(SET_COINS_LIST, response.data.data);
    }

    return response;
  },

  /**
   * Fetch all crypto coins data
   * @param  {Object} params         [request params]
   * @return {Array}                 [coins list with data]
   */
  async fetchAllCoinsData({ commit }, params) {
    const response = await coins().fetchAll(params);

    if (response.data.result) {
      response.data.data.forEach((coin) => {
        commit(SET_COIN_DATA, { name: coin.name, data: coin });
      });
    }

    return response;
  },

  /**
   * Fetch single coin data and hangle response error
   * @param  {Object} payload          [contain with coin name and request params]
   * @return {Array}                   [Coin data]
   */
  async fetchCoinData({ commit, dispatch }, { name, params }) {
    const response = await coin(name).fetchData(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot obtain ${name} data from server`,
      }, {
        root: true,
      });

      return response;
    }

    response.data.data.forEach((el) => {
      commit(SET_COIN_DATA, { name: el.name, data: el });
    });

    return response;
  },

  /**
   * Set fetched coin data in store
   * @param  {String} options.name   [Coin name]
   * @param  {Object} options.data   [Coin data]
   * @return {Object}                [Coin data]
   */
  setCoinData({ commit, state }, { name, data }) {
    if (!name || !data) {
      return false;
    }

    commit(SET_COIN_DATA, { name, data });

    return state.data[name];
  },

  /**
   * Fetch coin exchanges list
   * @param  {Object} payload        [Coin name with query params]
   * @return {Array}                 [Coin exchanges list]
   */
  async fetchCoinExchange({ commit, state }, { name, params }) {
    const response = await coin(name).fetchExchange(params);

    if (response.data.result) {
      response.data.data.forEach((coin) => {
        if (typeof state.exchange[coin.name] === 'undefined') {
          commit(ADD_COIN_TO_EXCHANGE, coin.name);
        }

        coin.exchanges.forEach(exchange => commit(SET_COIN_EXCHANGE, {
          name: coin.name,
          exchanger: exchange.name,
          data: exchange,
        }));
      });
    }

    return response;
  },

  /**
   * Set coins list sorting criteria
   * @param {String} str            [Sorting criteria]
   */
  setCoinsSorting({ commit }, str) {
    ls.setItem('sortCriteria', str);
    commit(SET_SORTING, str);
  },

  /**
   * Check if exist favorite coins in Locale Storage
   * If exist set it to the store
   * Else return empty array
   * @return {Array}                [Favorite coins list]
   */
  initFavCoins({ commit }) {
    const coins = JSON.parse(localStorage.getItem(localStorageKeys.fav)) || [];

    coins.forEach(coin => commit(ADD_FAV_COIN, coin));

    return coins;
  },

  /**
   * Change coin favorite status
   * @param  {String} name           [Coin name]
   * @return {Object}                [Favorite coin data]
   */
  toggleFavCoin({ commit, state }, name) {
    const index = state.fav.findIndex(el => el === name);

    if (index === -1) {
      commit(ADD_FAV_COIN, name);
      return { result: 'added', name, index };
    }

    commit(REMOVE_FAV_COIN, index);
    return { result: 'removed', name, index };
  },

  /**
   * Fetch active coins from Locale Storage
   * @return {Array}                 [Favorite coins list]
   */
  fetchActiveCoins({ commit }) {
    const coins = checkActiveCoins();

    coins.forEach(coin => commit(ADD_ACTIVE_COIN, coin));

    return coins;
  },

  /**
   * Remove coin from active coins list in Locale Storage
   */
  resetActiveCoins({ commit }) {
    commit(RESET_ACTIVE_COIN);
    ls.setItem('selectedCoins', '');
  },

  /**
   * Change coin active status
   * @param  {String} name           [Coin name]
   * @return {Object}                [Coin data]
   */
  toggleActiveCoin({ commit }, name) {
    const coins = checkActiveCoins();
    const index = coins.indexOf(name);

    if (index === -1) {
      coins.push(name);
      ls.setItem('selectedCoins', coins.toString());

      commit(ADD_ACTIVE_COIN, name);
      return { result: 'added', name, index };
    }

    coins.splice(index, 1);
    ls.setItem('selectedCoins', coins.toString());

    commit(REMOVE_ACTIVE_COIN, index);
    return { result: 'removed', name, index };
  },

  /**
   * Add coin to active coins list
   * @param  {String} name           [Coin name]
   * @return {Object}               [Coin data]
   */
  setActiveCoin({ commit }, name) {
    const coins = checkActiveCoins();
    const index = coins.indexOf(name);

    if (index === -1) {
      coins.push(name);
      ls.setItem('selectedCoins', coins.toString());

      commit(ADD_ACTIVE_COIN, name);
      return { result: 'added', name, index };
    }

    return { result: 'skipped', name, index };
  },

  /**
   * Add coin to grid
   * @param {String} coin           [Coin name]
   */
  setGridCoin({ commit }, coin) {
    commit(SET_GRID_COIN, coin);
  },

  /**
   * Remove coin from grid
   * @param {String} coin           [Coin name]
   */
  removeGridCoin({ commit }, coin) {
    commit(REMOVE_GRID_COIN, coin);
  },

  /**
   * Clear coins grid list
   */
  clearGridCoins({ commit }) {
    commit(CLEAR_GRID_COINS);
  },
};

const mutations = {
  [SET_COINS_LIST](state, arr) {
    state.list.all = [...arr];
  },

  [SET_TOP_COINS_LIST](state, arr) {
    state.list.top = [...arr];
  },

  [SET_COIN_DATA](state, payload) {
    Vue.set(state.data, payload.name, payload.data);
  },

  [SET_COIN_EXCHANGE](state, payload) {
    Vue.set(state.exchange[payload.name], payload.exchanger, payload.data);
  },

  [ADD_COIN_TO_EXCHANGE](state, name) {
    Vue.set(state.exchange, name, {});
  },

  [SET_SORTING](state, str) {
    state.sorting = str;
  },

  [ADD_FAV_COIN](state, name) {
    Vue.set(state.fav, state.fav.length, name);
    localStorage.setItem(localStorageKeys.fav, JSON.stringify(state.fav));
  },
  [REMOVE_FAV_COIN](state, index) {
    Vue.delete(state.fav, index);
    localStorage.setItem(localStorageKeys.fav, JSON.stringify(state.fav));
  },

  [ADD_ACTIVE_COIN](state, name) {
    Vue.set(state.active, state.active.length, name);
  },

  [REMOVE_ACTIVE_COIN](state, index) {
    Vue.delete(state.active, index);
  },

  [RESET_ACTIVE_COIN](state) {
    state.active = [];
  },

  [ADD_FILTER](state, name) {
    Vue.set(state.filters, state.filters.length, name);
  },

  [REMOVE_FILTER](state, index) {
    Vue.delete(state.filters, index);
  },

  [SET_GRID_COIN](state, coin) {
    state.grid = [...state.grid, coin];
  },
  [REMOVE_GRID_COIN](state, coin) {
    state.grid = state.grid.filter(el => el !== coin);
  },
  [CLEAR_GRID_COINS](state) {
    Vue.set(state, 'grid', []);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

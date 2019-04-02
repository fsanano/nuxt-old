/* eslint-disable no-shadow */
import Vue from 'vue';
import Raven from 'raven-js';
import ls from '~/helpers/localStorage';
import { index, namedIndex, userIndex } from '../api';

function checkActiveIndices() {
  const existIndices = ls.getItem('selectedIndices').data;
  return existIndices ? existIndices.split(',') : [];
}

// TODO: maybe add current user index fetching
const state = () => ({
  active: [],
  data: {},
  fav: [],
  list: [],
  userList: [],
  userIndexCoins: {},
  chosen: '',
  indexToDelete: '',
});

const ADD_INDEX_IN_DATA = 'INDICES/ADD_INDEX_IN_DATA';

const SET_INDICES_LIST = 'INDICES/SET_INDICES_LIST';
const ADD_INDICES_LIST_ITEM = 'INDICES/ADD_INDICES_LIST_ITEM';
const REMOVE_INDICES_LIST_ITEM = 'INDICES/REMOVE_INDICES_LIST_ITEM';

const SET_USER_INDICES_LIST = 'INDICES/SET_USER_INDICES_LIST';
const ADD_USER_INDICES_LIST_ITEM = 'INDICES/ADD_USER_INDICES_LIST_ITEM';
const REMOVE_USER_INDICES_LIST_ITEM = 'INDICES/REMOVE_USER_INDICES_LIST_ITEM';

const SET_INDEX_DATA = 'INDICES/SET_INDEX_DATA';
const SET_INDEX_VALUE = 'INDICES/SET_INDEX_VALUE';
const SET_INDEX_COINS = 'INDICES/SET_INDEX_COINS';
const REPLACE_INDEX_COINS = 'INDICES/REPLACE_INDEX_COINS';
const SET_INDEX_CHANGE = 'INDICES/SET_INDEX_CHANGE';
const SET_INDEX_CHOOSE = 'INDICES/SET_INDEX_CHOOSE';

const ADD_FAV_INDEX = 'INDICES/SET_INDEX_CHANGE';
const REMOVE_FAV_INDEX = 'INDICES/SET_INDEX_CHANGE';

const ADD_ACTIVE_INDEX = 'INDICES/ADD_ACTIVE_INDEX';
const REMOVE_ACTIVE_INDEX = 'INDICES/REMOVE_ACTIVE_INDEX';
const RESET_ACTIVE_INDICES = 'INDICES/RESET_ACTIVE_INDICES';

const SET_USER_INDEX_COINS = 'INDICES/SET_USER_INDEX_COINS';
const DELETE_USER_INDEX_COINS = 'INDICES/DELETE_USER_INDEX_COINS';
const RESET_USER_INDEX_COINS = 'INDICES/RESET_USER_INDEX_COINS';
const SET_INDEX_TO_DELETE = 'INDICES/SET_INDEX_TO_DELETE';

const getters = {};

const actions = {
  /**
   * Fetch all published common for all indices list
   * @param  {Object} params         [Request params]
   * @return {Array}                 [Common indices list]
   */
  async fetchAllIndices({ commit, dispatch }, params) {
    const response = await index().fetchAll(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: 'Cannot obtain indices data from server',
      }, {
        root: true,
      });
      return response;
    }

    commit(SET_INDICES_LIST, response.data.data.map(el => el.name));

    return response;
  },

  /**
   * Fetch user created indices list
   * @param  {Object} params         [Request params]
   * @return {Array}                 [User indices list]
   */
  async fetchAllUserIndices({ commit }, params) {
    const response = await userIndex().fetch(params.id);

    if (response.data.result) {
      commit(SET_USER_INDICES_LIST, response.data.data.map(el => el.name));
    }

    return response;
  },

  /**
   * Fetch active indices in Locale Storage
   * @return {Array}                [Active indices list]
   */
  fetchActiveIndices({ commit, state }) {
    const indices = checkActiveIndices();

    indices.forEach((index) => {
      if (state.active.findIndex(item => item === index) === -1) {
        commit(ADD_ACTIVE_INDEX, index);
      }
    });
    return indices;
  },

  /**
   * Add to store choosed indices
   * @param  {String} name           [Index name]
   * @return {String} Index name
   */
  setChosenIndex({ commit }, name) {
    commit(SET_INDEX_CHOOSE, name);
    return name;
  },

  /**
   * Remove indices from active list
   */
  resetActiveIndices({ commit }) {
    commit(RESET_ACTIVE_INDICES);
    ls.setItem('selectedIndices', '');
  },

  /**
   * Change index active status
   * @param  {String} name           [Index name]
   * @return {Object}                [Index data with status]
   */
  toggleActiveIndex({ commit, state }, name) {
    const index = state.active.findIndex(el => el === name);
    const indices = checkActiveIndices();

    if (index === -1) {
      indices.push(name);
      ls.setItem('selectedIndices', indices.toString());

      commit(ADD_ACTIVE_INDEX, name);
      return { result: 'added', name, index };
    }

    indices.splice(index, 1);
    ls.setItem('selectedIndices', indices.toString());

    commit(REMOVE_ACTIVE_INDEX, index);
    return { result: 'removed', name, index };
  },

  /**
   * Add index to active indices list
   * @param {String} name           [Index name]
   * @return {Object}               [Index data with status]
   */
  setActiveIndex({ commit, state }, name) {
    const index = state.active.findIndex(el => el === name);
    const indices = checkActiveIndices();

    if (index === -1) {
      indices.push(name);
      ls.setItem('selectedIndices', indices.toString());

      commit(ADD_ACTIVE_INDEX, name);
      return { result: 'added', name, index };
    }

    return { result: 'skipped', name, index };
  },

  /**
   * Fetch index data from api
   * @param  {String} options.name     [Index name]
   * @param  {Object} options.params   [Request params]
   * @return {Array}                   [Index data]
   */
  async fetchIndexData({ commit, dispatch }, { name, params }) {
    const response = await namedIndex(name).fetch(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot obtain ${name.toUpperCase()} data from server`,
      }, {
        root: true,
      });
      return response;
    }

    response.data.data.forEach((el) => {
      commit(SET_INDEX_DATA, { name: el.name, data: el });
    });

    return response;
  },

  /**
   * Create user index
   * @param  {String} name           [Index name]
   * @return {Object}                [User index data]
   */
  async createUserIndex({ commit, dispatch }, name) {
    const response = await userIndex(name).create();

    Raven.captureBreadcrumb({
      message: `Attempting to create user index ${name}`,
      category: 'indices',
      level: 'info', // error, warning, info, or debug.
    });

    if (!response.data.result) {
      Raven.captureBreadcrumb({
        message: `Failed to create user index ${name}`,
        category: 'indices',
        level: 'error', // error, warning, info, or debug.
        data: { response },
      });
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot create user index. ${Object.values(response.data.errors)[0][0]}`,
      }, {
        root: true,
      });
      return response;
    }

    Raven.captureBreadcrumb({
      message: `Successfully created user index named ${name}`,
      category: 'indices',
      level: 'info', // error, warning, info, or debug.
      data: { response },
    });

    commit(SET_INDEX_DATA, { name: response.data.name, data: response.data.data });
    commit(ADD_USER_INDICES_LIST_ITEM, response.data.name);

    return response;
  },
  /**
   * Change user index coins, replace old with new
   * @param  {Object} payload           [Index name and request params]
   * @return {Object}                   [Index data]
   */
  async changeUserIndexCoin({ commit, dispatch, rootState }, { index, params }) {
    const response = await userIndex(index).replace(params);
    const coins = params.coins[0];

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot change coin in ${index}. ${Object.values(response.data.errors)[0][0]}`,
      }, {
        root: true,
      });
      return response;
    }

    const coin = await dispatch('coins/fetchCoinData', {
      name: coins.new,
      params: {
        detail: true,
        convert: rootState.common.currency,
      },
    }, {
      root: true,
    });

    commit(REPLACE_INDEX_COINS, {
      index,
      old: coins.old,
      new: { name: coin.name, data: coin.data[0] },
    });

    return response;
  },

  /**
   * Update user indices
   * @param  {Object} payload        [Index name and index data]
   * @return {Object}                [Index data]
   */
  async updateUserIndex({ commit, state, dispatch }, { name, params }) {
    const response = await userIndex(name).update(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot update ${name} index. ${Object.values(response.data.errors)[0][0]}`,
      }, {
        root: true,
      });
      return response;
    }

    commit(SET_INDEX_DATA, { name: response.data.name, data: response.data.data });

    const type = response.data.status === 'pending' ? 'remove' : 'add';
    const indexName = response.data.name;

    if (type === 'add') {
      commit(ADD_INDICES_LIST_ITEM, indexName);
    } else {
      const index = state.list.indexOf(indexName);

      if (index !== -1) {
        commit(REMOVE_INDICES_LIST_ITEM, index);
      }
    }

    return response;
  },

  async setIndexToDelete({ commit }, name) {
    commit(SET_INDEX_TO_DELETE, name);
  },
  /**
   * Delete user created index
   * @param  {Object} payload          [Index name and query params]
   * @return {Object}                  [Remove index data]
   */
  async deleteUserIndex({ commit, state, dispatch }, { name, params }) {
    const response = await userIndex(name).delete(params);

    Raven.captureBreadcrumb({
      message: `Attempting to delete user index ${name}`,
      category: 'indices',
      level: 'info', // error, warning, info, or debug.
    });

    if (!response.data.result) {
      Raven.captureBreadcrumb({
        message: `Failed to delete user index ${name}`,
        category: 'indices',
        level: 'error', // error, warning, info, or debug.
        data: { response },
      });
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot delete ${name} index. ${Object.values(response.data.errors)[0][0]}`,
      }, {
        root: true,
      });
      return response;
    }
    dispatch('notifications/addNotification', {
      type: 'info',
      text: response.data.name,
    }, {
      root: true,
    });

    const index = state.active.indexOf(name);
    const userIndexIndex = state.userList.indexOf(name);

    commit(REMOVE_ACTIVE_INDEX, index);
    commit(REMOVE_USER_INDICES_LIST_ITEM, userIndexIndex);
    commit(SET_INDEX_CHOOSE, 'ICEI10');

    return response;
  },
  /**
   * Set user index coin
   * @param  {Object} payload        [Request params]
   * @return {Boolean}
   */
  setUserIndexCoin({ commit }, payload) {
    commit(SET_USER_INDEX_COINS, payload);
    return true;
  },
  /**
   * Delete user index coin
   * @param  {Object} payload        [Request params]
   * @return {Boolean}
   */
  deleteUserIndexCoin({ commit }, coin) {
    commit(DELETE_USER_INDEX_COINS, coin);
    return true;
  },
  /**
   * Reset user index coin
   * @param  {Object} payload        [Request params]
   * @return {Boolean}
   */
  resetUserIndexCoins({ commit }) {
    commit(RESET_USER_INDEX_COINS);
    return true;
  },
};

const mutations = {
  [SET_INDICES_LIST](state, arr) {
    state.list = [...arr];
  },

  [ADD_INDICES_LIST_ITEM](state, item) {
    state.list.push(item);
  },

  [REMOVE_INDICES_LIST_ITEM](state, index) {
    state.list.splice(index, 1);
  },

  [SET_USER_INDICES_LIST](state, arr) {
    state.userList = [...arr];
  },

  [ADD_USER_INDICES_LIST_ITEM](state, index) {
    state.userList.push(index);
  },

  [REMOVE_USER_INDICES_LIST_ITEM](state, index) {
    state.userList.splice(index, 1);
  },

  [ADD_INDEX_IN_DATA](state, name) {
    Vue.set(state.data, name, {});
  },

  [SET_INDEX_DATA](state, payload) {
    const { data } = payload;
    data.name = payload.name;
    Vue.set(state.data, payload.name, data);
  },

  [SET_INDEX_VALUE](state, payload) {
    Vue.set(state.data[payload.name], 'value', payload.data.value);
    Vue.set(state.data[payload.name], 'last_updated', payload.data.timestamp);
  },

  [SET_INDEX_COINS](state, payload) {
    Vue.set(state.data[payload.name], 'coins', payload.data);
  },

  [REPLACE_INDEX_COINS](state, payload) {
    const indexCoins = state.data[payload.index].coins;
    const oldCoinIndex = indexCoins.findIndex(coin => coin.name === payload.old);

    indexCoins.splice(oldCoinIndex, 1, payload.new.data);
  },

  [SET_INDEX_CHANGE](state, payload) {
    Vue.set(state.data[payload.name], 'changes_custom', payload.data);
  },

  [SET_INDEX_CHOOSE](state, name) {
    state.chosen = name;
  },

  [ADD_FAV_INDEX](state, name) {
    Vue.set(state.fav, state.fav.length, name);
  },
  [REMOVE_FAV_INDEX](state, index) {
    Vue.delete(state.fav, index);
  },

  [ADD_ACTIVE_INDEX](state, name) {
    Vue.set(state.active, state.active.length, name);
  },

  [REMOVE_ACTIVE_INDEX](state, index) {
    Vue.delete(state.active, index);
  },

  [SET_INDEX_TO_DELETE](state, index) {
    state.indexToDelete = index;
  },

  [RESET_ACTIVE_INDICES](state) {
    Vue.set(state, 'active', []);
  },

  [SET_USER_INDEX_COINS](state, payload) {
    if (state.userIndexCoins[payload.name] === undefined) {
      const index = Object.keys(state.userIndexCoins).length;
      Vue.set(state.userIndexCoins, payload.name, { index });
    }

    if (payload.percent !== undefined) {
      Vue.set(state.userIndexCoins[payload.name], 'percent', payload.percent);
    }
    if (payload.cost !== undefined) {
      Vue.set(state.userIndexCoins[payload.name], 'cost', payload.cost);
    }
  },

  [DELETE_USER_INDEX_COINS](state, coin) {
    Vue.delete(state.userIndexCoins, coin);
  },

  [RESET_USER_INDEX_COINS](state) {
    state.userIndexCoins = {};
  },

};

export default {
  state,
  getters,
  actions,
  mutations,
};

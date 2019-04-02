/* eslint-disable no-shadow */
import Vue from 'vue';
import { coin, namedIndex } from '../api';

const state = () => ({
  data: {},
  historyMinDate: {},
});

const ADD_KEY = 'ADD_KEY';
const SET_HISTORY = 'SET_HISTORY';
const SET_START_HISTORY_DATE = 'SET_START_HISTORY_DATE';
const ADD_HISTORY_ITEM = 'ADD_HISTORY_ITEM';

const getters = {};

const actions = {
  /**
   * Fetch coin or index history
   * @param commit
   * @param state
   * @param dispatch
   * @param entity
   * @param name - coin or index name
   * @param params - xhr params
   */
  async fetch({ commit, state, dispatch }, { name, entity, params }) {
    let response = {};

    if (entity === 'coin') {
      response = await coin(name).fetchHistory(params);
    } else if (entity === 'index') {
      response = await namedIndex(name).fetchHistory(params);
    }

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: `Cannot fetch ${name} history. Error: ${Object.values(response.data.errors)[0][0]}`,
      }, {
        root: true,
      });
      return response;
    }

    response.data.data.forEach((item) => {
      const name = item.name.toLowerCase();
      if (typeof state.data[name] === 'undefined') {
        commit(ADD_KEY, name);
      }

      commit(SET_START_HISTORY_DATE, { name, date: item.minDate });
    });

    return response;
  },
  addHistoryItem({ commit }, { name, interval, data }) {
    commit(ADD_HISTORY_ITEM, { name, interval, data });
  },
};

const mutations = {
  [ADD_KEY](state, key) {
    Vue.set(state.data, key, {});
  },
  [SET_HISTORY](state, payload) {
    Vue.set(state.data[payload.name], payload.interval, Object.assign(
      {},
      state.data[payload.name][payload.interval],
      payload.data,
    ));
  },
  [SET_START_HISTORY_DATE](state, { name, date }) {
    Vue.set(state.historyMinDate, name, date);
  },
  [ADD_HISTORY_ITEM](state, { name, interval, data }) {
    Vue.set(state.data[name][interval], data.timestamp, data);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

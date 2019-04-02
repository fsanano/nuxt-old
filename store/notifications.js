/* eslint-disable no-shadow */
import Vue from 'vue';
import Raven from 'raven-js';

const state = () => ([]);

const ADD = 'ADD';
const REMOVE = 'REMOVE';

const getters = {};

const actions = {
  addNotification({ commit, state }, { type, text }) {
    if (state.length <= 10) {
      Raven.captureBreadcrumb({
        message: 'Notification has been shown to user',
        category: 'notifications',
        level: type, // error, warning, info, or debug.
        data: { text },
      });
      commit(ADD, Object.assign({ type, text }, {
        id: Date.now() + (Math.random() * 10),
      }));
    }
  },
  removeNotification({ commit, state }, id) {
    const index = state.findIndex(el => el.id === id);

    if (index > -1) {
      commit(REMOVE, index);
    }
  },
};

const mutations = {
  [ADD](state, payload) {
    Vue.set(state, state.length, payload);
  },
  [REMOVE](state, index) {
    Vue.delete(state, index);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

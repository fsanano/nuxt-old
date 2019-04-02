/* eslint-disable no-shadow */
import Vue from 'vue';
import { news } from '../api';

const state = () => ({
  posts: {},
  categories: [],
  tags: [],
  pagination: null,
});

const ADD_POST = 'ADD_POST';
const SET_CATEGORIES = 'SET_CATEGORIES';
const SET_TAGS = 'SET_TAGS';
const SET_PAGINATION = 'SET_PAGINATION';
const CLEAR_CATEGORIES = 'CLEAR_CATEGORIES';
const CLEAR_TAGS = 'CLEAR_TAGS';
const CLEAR_POSTS = 'CLEAR_POSTS';
const CLEAR_PAGINATION = 'CLEAR_SET_PAGINATION';

const getters = {};

const actions = {
  async fetchAll({ commit, dispatch }, params) {
    const response = await news().fetchAll(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
      return response;
    }

    response.data.data.forEach(el => commit(ADD_POST, el));

    commit(SET_PAGINATION, response.data.pagination);

    return response;
  },
  async fetchByID({ commit, dispatch }, payload) {
    const response = await news().fetchByID(payload.id, payload.params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
      return response;
    }

    // commented code below breaks img src attribute [782]
    /* eslint-disable max-len */
    // const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
    // const content = data.data.content.replace(urlRegex, url => `<a href="${url}" rel="nofollow">${url}</a>`);
    // // or use https://github.com/phanan/vue-linkify if regexp works bag
    // data.data.content = content;
    /* eslint-enable max-len */

    commit(ADD_POST, response.data.data);

    return response;
  },
  async fetchCategories({ commit, dispatch }, params) {
    const response = await news().fetchCategories(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
      return response;
    }

    commit(SET_CATEGORIES, response.data.data);

    return response;
  },
  async fetchTags({ commit, dispatch }, params) {
    const response = await news().fetchTags(params);

    if (!response.data.result) {
      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
      return response;
    }

    commit(SET_TAGS, response.data.data);

    return response;
  },

  setPagination({ commit }, payload) {
    commit(SET_PAGINATION, payload);
  },

  clearState({ commit }) {
    commit(CLEAR_CATEGORIES);
    commit(CLEAR_POSTS);
    commit(CLEAR_TAGS);
    commit(CLEAR_PAGINATION);
  },

  clearTags({ commit }) {
    commit(CLEAR_TAGS);
  },

  clearPosts({ commit }) {
    commit(CLEAR_POSTS);
  },

  clearCategories({ commit }) {
    commit(CLEAR_CATEGORIES);
  },

  clearPagination({ commit }) {
    commit(CLEAR_PAGINATION);
  },
};

const mutations = {
  [ADD_POST](state, post) {
    Vue.set(state.posts, post.id, post);
  },
  [SET_CATEGORIES](state, categories) {
    Vue.set(state, 'categories', categories);
  },
  [SET_TAGS](state, tags) {
    Vue.set(state, 'tags', tags);
  },
  [SET_PAGINATION](state, payload) {
    Vue.set(state, 'pagination', payload);
  },
  [CLEAR_CATEGORIES](state) {
    Vue.set(state, 'categories', []);
  },
  [CLEAR_TAGS](state) {
    Vue.set(state, 'tags', []);
  },
  [CLEAR_POSTS](state) {
    Vue.set(state, 'posts', {});
  },
  [CLEAR_PAGINATION](state) {
    Vue.set(state, 'pagination', null);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

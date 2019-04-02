/* eslint-disable no-shadow */
import Raven from 'raven-js';
import { auth, user } from '../api';

const defaultUserData = {
  token: '',
  user_email: '',
  user_name: '',
  user_id: null,
  status: '',
};

function setUserContext(state) {
  return Raven.setUserContext({
    id: state.data.user_id,
    username: state.data.user_name,
    email: state.data.user_email,
    status: state.data.status,
  });
}

const state = () => ({
  auth: false,
  data: Object.assign({}, defaultUserData),
});

const USERDATA = 'AUTH/USERDATA';

const getters = {
  isUserLoggedIn: (state) => {
    if (!state.data.token) {
      return false;
    }
    return state.data.token.length > 0;
  },
};

const actions = {
  async signup({ commit, dispatch, state }, params) {
    const response = await auth().signup(params);

    Raven.captureBreadcrumb({
      message: 'Attempting to sign up',
      category: 'auth',
      level: 'info', // error, warning, info, or debug.
      data: { params },
    });

    if (response.data.result) {
      commit(USERDATA, { data: response.data.data, auth: true });
      setUserContext(state);

      Raven.captureBreadcrumb({
        message: `Successfully signed up as ${response.data.data.user_name}`,
        category: 'auth',
        level: 'info', // error, warning, info, or debug.
      });
    } else {
      Raven.captureBreadcrumb({
        message: 'Failed to sign up',
        category: 'auth',
        level: 'error', // error, warning, info, or debug.
        data: { response },
      });

      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
    }

    return response;
  },

  async signin({ commit, dispatch, state }, params) {
    const response = await auth().signin(params);

    Raven.captureBreadcrumb({
      message: 'Attempting to sign in',
      category: 'auth',
      level: 'info', // error, warning, info, or debug.
      data: { params },
    });

    if (response.data.result) {
      commit(USERDATA, { data: response.data.data, auth: true });
      setUserContext(state);
      Raven.captureBreadcrumb({
        message: `Successfully signed in as ${response.data.data.user_name}`,
        category: 'auth',
        level: 'info', // error, warning, info, or debug.
      });
    } else {
      Raven.captureBreadcrumb({
        message: 'Failed to sign in',
        category: 'auth',
        level: 'error', // error, warning, info, or debug.
        data: { response },
      });
      dispatch('notifications/addNotification', {
        type: 'error',
        text: Object.values(response.data.errors)[0][0],
      }, {
        root: true,
      });
    }

    return response;
  },

  async getUserData({ commit, state }, token) {
    const response = await user().data(token);

    if (response.data.result) {
      commit(USERDATA, { data: response.data.data, auth: true });
      setUserContext(state);
    }

    return response;
  },

  async logout({ commit, state }, token) {
    const response = await auth().logout(token);

    Raven.captureBreadcrumb({
      message: 'Attempting to log out',
      category: 'auth',
      level: 'info', // error, warning, info, or debug.
      data: { tokenExists: !!token },
    });

    if (response.data.result) {
      Raven.captureBreadcrumb({
        message: `${state.data.user_name} successfully logged out`,
        category: 'auth',
        level: 'info', // error, warning, info, or debug.
      });
      commit(USERDATA, { data: Object.assign({}, defaultUserData), auth: false });
      Raven.setUserContext();
    }

    return response;
  },
};

const mutations = {
  [USERDATA](state, payload) {
    state.data = payload.data;
    state.auth = payload.auth;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};

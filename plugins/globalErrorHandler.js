/* eslint-disable */
import Vue from 'vue';
import Raven from 'raven-js';

export default ({ store }) => {
  Vue.config.errorHandler = (error) => {
    Raven.setExtraContext({ state: store.state });
    Raven.setUserContext({
      id: store.state.auth.data.user_id,
      username: store.state.auth.data.user_name,
      email: store.state.auth.data.user_email,
      status: store.state.auth.data.status,
    });
    Raven.captureException(error);

    console.error(error); // eslint-disable-line no-console
  };
};

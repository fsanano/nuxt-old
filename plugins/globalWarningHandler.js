import Vue from 'vue';
import Raven from 'raven-js';

export default ({ store }) => {
  Vue.config.warnHandler = (warn) => {
    Raven.setExtraContext({ state: store.state });
    Raven.setUserContext({
      id: store.state.auth.data.user_id,
      username: store.state.auth.data.user_name,
      email: store.state.auth.data.user_email,
      status: store.state.auth.data.status,
    });
    Raven.captureMessage(warn, {
      level: 'warning', // one of 'info', 'warning', or 'error'
    });

    console.warn(warn); // eslint-disable-line no-console
  };
};

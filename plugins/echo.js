/* eslint-disable */
import Vue from 'vue';
import Raven from 'raven-js';
import moment from 'moment';
import echo from '~/echo';

const plugin = {
  install(Vue) {
    Vue.prototype.$echo = echo;

    return Vue.prototype.$echo;
  },
};

Vue.use(plugin);

const messages = {
  en: {
    successfulConnection: 'WebSocket connection successfully established',
    successfulReconnection: 'WebSocket successfully reconnected after {number} tries',
    connectionError: 'WebSocket connection error: {error}. Attempting to reconnect now',
    connectionTimedOut: 'Failed to establish WebSocket connection after {timeout} seconds',
    errorOccurs: 'WebSocket error occurs: {error}',
  },
  ru: {
    successfulConnection: 'Соединение с веб-сокетом успешно установлено',
    successfulReconnection: 'Соединение с веб-сокетом успешно установлено спустя {number} попыток',
    connectionError: 'Ошибка подключения к веб-сокету: {error}. Пытаемся переподключиться прямо сейчас',
    connectionTimedOut: 'Не удалось установить соединение c веб-сокетом спустя {timeout} секунд',
    errorOccurs: 'Произошла ошибка в веб-сокете: {error}',
  },
};

const validateTimestamp = {
  '1m'(unix) {
    return moment(unix).utc().set({ D: 1, h: 0, m: 0, s: 0, ms: 0 }).valueOf() === unix;
  },
  '1w'(unix) {
    return moment(unix).utc().set({ h: 0, m: 0, s: 0, ms: 0 }).valueOf() === unix;
  },
  '1d'(unix) {
    return moment(unix).utc().set({ h: 0, m: 0, s: 0, ms: 0 }).valueOf() === unix;
  },
  '1h'(unix) {
    return moment(unix).utc().set({ m: 0, s: 0, ms: 0 }).valueOf() === unix;
  },
  '5i'(unix) {
    const minutes = moment(unix).minutes();
    return minutes % 5 === 0 && moment(unix).utc().set({ s: 0, ms: 0 }).valueOf() === unix;
  },
  '1i'(unix) {
    return moment(unix).utc().set({ s: 0, ms: 0 }).valueOf() === unix;
  },
  '30s'(unix) {
    const seconds = moment(unix).seconds();
    return seconds % 30 === 0 && moment(unix).utc().set({ ms: 0 }).valueOf() === unix;
  },
  '15s'(unix) {
    const seconds = moment(unix).seconds();
    return seconds % 15 === 0 && moment(unix).utc().set({ ms: 0 }).valueOf() === unix;
  },
  '5s'(unix) {
    const seconds = moment(unix).seconds();
    return seconds % 5 === 0 && moment(unix).utc().set({ ms: 0 }).valueOf() === unix;
  },
};

function validateSocketEvent({ channel, data }) {
  const [prefix] = channel.split(':');

  switch (prefix) {
    case 'index':
    case 'coins':
      validateCandle({ channel, data });
      break;
    case 'exchanges':
      validateExchange({ channel, data });
      break;
    default:
      break;
  }
}

function validateCandle({ channel, data }) {
  const d = JSON.parse(data);
  const keys = ['avg', 'cap', 'change', 'close', 'max', 'min', 'open', 'period_start', 'updated_at', 'vol'];
  const missedKeys = [];
  const [, , , interval] = channel.split(':');
  const extra = { channel, d };
  let sendReport = false;

  /**
   * Check existence of all necessary keys
   * Because there might be a bug when socket returns only cap or vol
   */
  keys.forEach((el) => {
    if (typeof d[el] === 'undefined') {
      missedKeys.push(el);
      sendReport = true;
    }
  });

  extra.missedKeys = missedKeys;

  if (!validateTimestamp[interval](1 * d.period_start)) {
    extra.invalidTimestamp = true;
    sendReport = true;
  }

  if (sendReport) {
    Raven.setExtraContext(extra);
    Raven.captureMessage('Invalid candle data received from socket');
  }
}

function validateExchange({ channel, data }) {
  const d = JSON.parse(data);

  /**
   * Sometimes socket can return -1 value for some key, we should check it
   * @type {boolean}
   */
  const hasNegativeValue = Object.values(d).some(el => el <= 0);

  if (hasNegativeValue) {
    Raven.setExtraContext({ channel, exchangeData: d });
    Raven.captureMessage('Exchanges data has negative or equal zero value');
  }
}

export default ({ app, store, isDev }) => {
  function setUserContext() {
    return Raven.setUserContext({
      id: store.state.auth.data.user_id,
      username: store.state.auth.data.user_name,
      email: store.state.auth.data.user_email,
      status: store.state.auth.data.status,
    });
  }

  app.echo = echo;

  app.i18n.mergeLocaleMessage('en', messages.en);
  app.i18n.mergeLocaleMessage('ru', messages.ru);

  echo.channel('fiats')
    .listen('.update', e => store.dispatch('common/setExchangeRates', e));
  Raven.captureBreadcrumb({
    message: 'Joined fiats socket channel',
    category: 'socket',
    level: 'info', // error, warning, info, or debug.
  });


  echo.connector.socket.on('connect', () => {
    Raven.captureBreadcrumb({
      message: 'Socket connection successfully established',
      category: 'socket',
      level: 'info', // error, warning, info, or debug.
    });

    if (store.state.common.socketStatus !== 2 && isDev) {
      store.dispatch('notifications/addNotification', {
        type: 'info',
        text: app.i18n.t('successfulConnection'),
      });
    }
    store.dispatch('common/setSocketStatus', 2);
  });

  echo.connector.socket.on('connect_error', (error) => {
    /**
     * Show notification only once on each connection error in case of unsuccessful reconnection attempts
     */
    if (store.state.common.socketStatus !== 1) {
      store.dispatch('notifications/addNotification', {
        type: 'error',
        text: app.i18n.t('connectionError', { error: error.message }),
      });
    }
    store.dispatch('common/setSocketStatus', 1);

    Raven.captureBreadcrumb({
      message: 'Socket connection error occurred',
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
      data: { error },
    });

    Raven.setExtraContext({
      subscriptions: Object.keys(echo.connector.channels),
      error,
    });

    setUserContext();

    Raven.captureMessage('WebSocket connection error');
  });

  echo.connector.socket.on('connect_timeout', (timeout) => {
    store.dispatch('notifications/addNotification', {
      type: 'warn',
      text: app.i18n.t('connectionTimedOut', { timeout }),
    });
    store.dispatch('common/setSocketStatus', 1);

    Raven.captureBreadcrumb({
      message: `Socket lost connection due to ${timeout}ms timeout`,
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
      data: { timeout },
    });

    Raven.setExtraContext({
      subscriptions: Object.keys(echo.connector.channels),
      timeout,
    });

    setUserContext();

    Raven.captureMessage('Failed to establish WebSocket connection due to timeout');
  });

  /**
   * It's unlikely that socket error even will appear and will break connection
   * Then show only notification but don't change socket connection status
   */
  echo.connector.socket.on('error', (error) => {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      text: app.i18n.t('errorOccurs', { error: error.message }),
    });

    Raven.captureBreadcrumb({
      message: 'Socket error occurred',
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
      data: { error },
    });

    Raven.setExtraContext({
      subscriptions: Object.keys(echo.connector.channels),
      error,
    });

    setUserContext();

    Raven.captureException(error);
  });

  echo.connector.socket.on('reconnect', (attempting) => {
    Raven.captureBreadcrumb({
      message: `Socket trying to reconnect. Try #${attempting}.`,
      category: 'socket',
      level: 'warning', // error, warning, info, or debug.
      data: { attempting },
    });
    store.dispatch('notifications/addNotification', {
      type: 'info',
      text: app.i18n.t('successfulReconnection', { number: attempting }),
    });
    store.dispatch('common/setSocketStatus', 2);
  });

  /**
   *  Actually, we don't wanna show any notification on each socket disconnect
   *  in case there possibly will be a lot of them
   */
  echo.connector.socket.on('disconnect', (reason) => {
    Raven.captureBreadcrumb({
      message: 'Socket disconnected',
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
      data: { reason },
    });
  });

  /**
   * No need to do something on reconnection related events because we already know
   * socket connection status via events callbacks described above and we already
   * definitely sure there will be reconnection attempts. so don't bother users, okay?
   */
  echo.connector.socket.on('reconnect_attempt', (attempting) => {
    Raven.captureBreadcrumb({
      message: `Attempting to reconnect to socket. Try #${attempting}.`,
      category: 'socket',
      level: 'warning', // error, warning, info, or debug.
      data: { attempting },
    });
  });
  echo.connector.socket.on('reconnecting', (attempting) => {
    Raven.captureBreadcrumb({
      message: `Reconnect to socket. Try #${attempting}`,
      category: 'socket',
      level: 'warning', // error, warning, info, or debug.
      data: { attempting },
    });
  });
  echo.connector.socket.on('reconnect_error', (error) => {
    Raven.captureBreadcrumb({
      message: `Socket reconnect error occurred`,
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
      data: { error },
    });
  });
  echo.connector.socket.on('reconnect_failed', () => {
    Raven.captureBreadcrumb({
      message: `Socket reconnect failed`,
      category: 'socket',
      level: 'error', // error, warning, info, or debug.
    });
  });

  echo.connector.socket.on('update', (channel, data) => {
    validateSocketEvent({ channel, data });
    /**
     * Sometimes strange bug appears that socket is working properly, but status says opposite [ICEX-1122]
     */
    if (store.state.common.socketStatus !== 2) {
      store.dispatch('common/setSocketStatus', 2);
    }
  });
}

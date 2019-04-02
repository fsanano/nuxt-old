/* eslint-disable no-console */
import Vue from 'vue';

export default ({ app, store }) => {
  async function runSocketTest(cycles) {
    console.time('socket test');
    const coins = await store.dispatch('coins/fetchCoinsList');

    const promises = coins.data.data.map(name => store.dispatch('coins/fetchCoinExchange', { name }));

    await Promise.all(promises);

    const intervals = ['1m', '1w', '1d', '1h', '5i', '1i', '30s', '15s', '5s'];
    const channels = [];

    coins.data.data.forEach(name => intervals.forEach(i => channels.push(`coins:${name}:data:${i}`)));
    Object.keys(store.state.coins.exchange).forEach((coin) => {
      Object.keys(store.state.coins.exchange[coin]).forEach((exchanger) => {
        store.state.coins.exchange[coin][exchanger].trade_pairs.forEach((pair) => {
          channels.push(`exchanges:${exchanger}:${pair}`);
        });
      });
    });

    // console.log(channels);


    for (let i = 0; i <= cycles; i += 1) {
      setTimeout(() => {
        try {
          channels.forEach(ch => app.echo.channel(ch).listen('.update', e => e));
          console.log('joined');
        } catch (e) {
          console.error(e.message);
        }
        try {
          channels.forEach(ch => app.echo.leave(ch));
          console.log('left');
        } catch (e) {
          console.error(e.message);
        }
      }, 1000 * i);
    }

    console.log('DONE!');
    console.timeEnd('socket test');
  }

  const plugin = {
    install(Vue) { // eslint-disable-line
      Vue.prototype.$runSocketTest = runSocketTest;

      return Vue.prototype.$runSocketTest;
    },
  };

  Vue.use(plugin);

  app.runSocketTest = runSocketTest;
};

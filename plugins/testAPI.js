/* eslint-disable no-console */
import Vue from 'vue';

export default ({ app, store }) => {
  async function runTest(attempts) {
    const coins = await store.dispatch('coins/fetchCoinsList');
    const intervals = ['1m', '1w', '1d', '1h'];
    const promises = [];
    const results = {
      firstDrop: 0,
      failedTotal: 0,
      successTotal: 0,
      requestsTotal: 0,
      successTotalPercents: 0,
    };

    coins.data.data.forEach((el) => {
      intervals.forEach((i) => {
        for (let k = 0; k <= attempts; k += 1) {
          promises.push(store.dispatch('history/fetch', {
            name: el,
            entity: 'coin',
            params: {
              count: 4999,
              interval: i,
              coin: el,
            },
          }));
        }
      });
    });

    const response = await Promise.all(promises);

    response.map((r, i) => {
      if (!r.data.result && !results.firstDrop) {
        results.firstDrop = i + 1;
      }
      if (!r.data.result) {
        results.failedTotal += 1;
      } else {
        results.successTotal += 1;
      }
      return r;
    });

    results.requestsTotal = response.length;
    results.successTotalPercents = (results.successTotal / results.requestsTotal) * 100;
    console.table(results);
    // const result = response.data.data.map(r => ({
    //   coin: r.coin,
    //   interval: r.interval,
    //   values: r.data[0].values.filter((el) => {
    //     console.log(r.name, r.interval);
    //     return el.timestamp && el.timestamp.toString().slice(9) !== '0000';
    //   }),
    // }));

    // console.log(result);
  }

  const plugin = {
    install(Vue) { // eslint-disable-line
      Vue.prototype.$runAPITest = runTest;

      return Vue.prototype.$runAPITest;
    },
  };

  Vue.use(plugin);

  app.runAPITest = runTest;
};

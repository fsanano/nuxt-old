<template>
</template>

<script>
  export default {
    layout: 'base',
    // eslint-disable-next-line
    async fetch({ store, params, error, redirect }) {
      // eslint-disable-next-line
      const { lang, coin, interval, currency } = params;

      if (lang !== 'en' && lang !== 'ru') {
        return error({ statusCode: 404, message: 'Page not found. Incorrect language chosen.' });
      }

      const fiats = await store.dispatch('common/fetchCurrenciesList');

      if (
        fiats.data.result &&
        fiats.data.data.map(el => el.short).findIndex(el => el === currency.toUpperCase()) === -1
      ) {
        return error({ statusCode: 404, message: 'Page not found. No such currency is supported.' });
      }

      const allowedIntervals = [
        'minute', 'five_minutes', 'hour', 'day', 'week', 'month', undefined,
      ];

      if (allowedIntervals.findIndex(el => el === interval) === -1) {
        return error({ statusCode: 404, message: 'Page not found. Incorrect interval parameter.' });
      }

      if (typeof coin === 'undefined') {
        return redirect(301, `/${lang}/coins`);
      }

      const { data } = await store.dispatch('coins/fetchCoinsList');

      if (data.result) {
        if (data.data.findIndex(el => el === coin) === -1) {
          return error({ statusCode: 404, message: 'Page not found. No such coin exists.' });
        }
        return redirect(301, `/${lang}/coins/${coin}`);
      }

      return error({ statusCode: 503, message: 'Something went wrong.' });
    },
  };
</script>

<style lang="scss">

</style>

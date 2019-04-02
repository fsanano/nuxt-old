<template>
</template>

<script>
  export default {
    layout: 'base',
    // eslint-disable-next-line
    async fetch({ store, params, error, redirect }) {
      // eslint-disable-next-line
      const { lang, index, interval, currency } = params;

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

      if (typeof index === 'undefined') {
        return redirect(301, `/${lang}/indices`);
      }

      const { data } = await store.dispatch('indices/fetchAllIndices', {
        token: store.state.auth.data.token,
      });

      if (data.result) {
        if (data.data.map(el => el.name).findIndex(el => el === index) === -1) {
          return error({ statusCode: 404, message: 'Page not found. No such index.' });
        }
        return redirect(301, `/${lang}/indices/${index}`);
      }

      return error({ statusCode: 503, message: 'Something went wrong.' });
    },
  };
</script>

<style lang="scss">

</style>

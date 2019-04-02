<template lang="pug"></template>

<script>
  export default {
    name: 'old-coin-page',
    // TODO: remove this page after 6th April 2018
    fetch({ redirect, params, error }) {
      if (params.lang !== 'en' && params.lang !== 'ru') {
        return error({ statusCode: 404, message: 'lang not found' });
      }
      return redirect(301, '/en/usd/indices');
    },
  };
</script>

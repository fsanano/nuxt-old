<template lang="pug"></template>

<script>
  export default {
    name: 'old-coin-page',
    // TODO: remove this page after 6th April 2018
    head() {
      return {
        __dangerouslyDisableSanitizers: ['script'],
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(this.$schemaBuilder().organizationData),
          },
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(this.$schemaBuilder().webSiteData),
          },
        ],
      };
    },
    fetch({ redirect }) {
      redirect(301, '/en/indices');
    },
  };
</script>

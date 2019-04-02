<template lang="pug">
  .page__container
    .info__header
      .info__header-title
        span.blue {{$t('faq.icex')}}
        | {{$t('faq.title')}}

    .info__content
      .info__title(v-html="$t('faq.term')")
      .info__date(v-html="$t('faq.date')")
      .info__desc The websites and the services offered by Coinbase are NOT addressed to persons who have their registered office or place of residence in Germany. Coinbase services are provided by Coinbase UK, Ltd., a UK entity. Coinbase UK, Ltd. is not a regulated financial services provider and does not operate outside the UK.

      .info__subtitle 1. Creating an ICEX Account

      .info__desc Apparently spooked by bitcoin’s recent growth and popularity, Mexico’s central bank and finance industry warned consumers that initial coin offerings violate the law and claimed cryptocurrencies were risky investments, according to Reuters.

      .info__subtitle 2. Mexican Authorities Call ICOs Illegal, Cryptocurrencies Risky

      .info__desc CNBV, the country’s securities regulator, joined other government authorities in stating that Mexico does not recognize cryptocurrencies as a legal form of payment. The statement further noted there have been no ICOs to originate in Mexico.
    span(hidden) Version: {{ env.GIT_HASH_SHORT }}

</template>

<script>

  export default {
    layout: 'base',
    name: 'index-page',

    head() {
      return {
        title: this.$t('meta.pages.faq.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.faq.title'),
          },
        ],
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

    asyncData({ env }) {
      return {
        env,
      };
    },

    components: {
    },

    methods: {
    },

    computed: {
    },
  };
</script>

<style lang="scss">
  @import '~assets/sass/blocks/info.sass';
</style>

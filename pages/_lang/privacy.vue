<template lang="pug">
  .page__container
    .info__header
      .info__header-title
        span.blue ICEX
        | {{$t('privacy.title')}}

    .info__content
      .info__title(v-html="$t('privacy.title')")
      .info__date(v-html="$t('privacy.lastUpdate')")
      .info__desc(v-html="$t('privacy.desc')")

      .info__section(v-for="section in sections")
        .info__subtitle(v-html="$t(`privacy.sections.${section}.title`)")

        .info__desc(v-html="$t(`privacy.sections.${section}.desc`)")


</template>

<script>

  export default {
    layout: 'base',
    name: 'index-page',

    head() {
      return {
        title: this.$t('meta.pages.privacy.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.privacy.title'),
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

    data() {
      return {
        sections: [
          'collection',
          'logdata',
          'cookies',
          'service',
          'communications',
          'compliance',
          'security',
          'international',
          'linksToOther',
          'children',
          'change',
          'contact',
        ],
      };
    },
  };
</script>

<style lang="scss">
  @import '~assets/sass/blocks/info.sass';
</style>

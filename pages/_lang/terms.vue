<template lang="pug">
  .page__container
    .info__header
      .info__header-title
        span.blue ICEX
        | {{$t('terms.title')}}

    .info__content
      .info__title(v-html="$t('terms.title')")
      .info__date(v-html="$t('terms.lastUpdate')")
      .info__desc(v-html="$t('terms.desc')")

      .info__section(v-for="section in sections")
        .info__subtitle(v-html="$t(`terms.sections.${section}.title`)")

        .info__desc(v-html="$t(`terms.sections.${section}.desc`)")


</template>

<script>

  export default {
    layout: 'base',
    name: 'index-page',

    head() {
      return {
        title: this.$t('meta.pages.terms.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.terms.title'),
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
          'purchases',
          'availability',
          'contests',
          'accounts',
          'property',
          'links',
          'termination',
          'limitation',
          'disclaimer',
          'law',
          'changes',
          'contact',
        ],
      };
    },
  };
</script>

<style lang="scss">
  @import '~assets/sass/blocks/info.sass';
</style>

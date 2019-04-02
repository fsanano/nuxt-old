<template lang="pug">
  table.h-100.mx-auto.text-center
    tbody
      tr
        td(colspan="3")
          h4 {{ $t('oldBrowserPage.title') }}
      tr
        td
          img.browser-logo(
          src="~static/img/browsers/google-chrome-logo.svg",
          alt="Google Chrome logo",
          )
          h4 Google Chrome
          a.button-proceed(href="https://www.google.com/chrome/index.html", target="_blank") {{ $t('oldBrowserPage.download') }}
        td
          img.browser-logo(
          src="~static/img/browsers/mozilla-firefox-logo.svg",
          alt="Mozilla Firefox logo",
          )
          h4 Mozilla Firefox
          a.button-proceed(href="https://www.mozilla.org", target="_blank") {{ $t('oldBrowserPage.download') }}
        td
          img.browser-logo(
          src="~static/img/browsers/opera-logo.svg",
          alt="Opera logo",
          )
          h4 Opera
          a.button-proceed(href="https://www.opera.com", target="_blank") {{ $t('oldBrowserPage.download') }}
        tr
          td(colspan="3")
            p {{ $t('oldBrowserPage.titleProceed') }}
            button.button-proceed(
            type="button",
            @click="performProceed"
            ) {{ $t('oldBrowserPage.buttonProceed') }}
</template>

<script>
  import i18n from './i18n.json';

  export default {
    name: 'old-browser',
    methods: {
      async performProceed() {
        await this.$store.dispatch('common/setBrowserCheck', true);
        return this.$router.push(`/${this.$store.state.common.locale}/indices`);
      },
    },
    async beforeMount() {
      return this.$store.dispatch('common/setUserDefaultParams');
    },
    i18n,
  };
</script>

<style lang="sass" scoped>
  @import "./old"
</style>

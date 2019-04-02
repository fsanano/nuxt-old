<template lang="pug">

  div.layout__container(:class="[theme, {'__short': menu === 'max', 'layout__container--mobile': isMobile}]")
    DefaultHeader()
    DefaultAside
    .notification-wrap
      transition-group(appear, name="notification", tag="div", mode="out-in")
        notification(
          v-for="item, index in notifications",
          :key="item.id",
          :id="item.id",
          :type="item.type",
          :text="item.text",
          @close="removeNotification($event)"
        )
    .layout__content(:class="layoutScrollClass")
      nuxt

    addIndex
    confirmationModal

</template>

<script>
  import { mapState } from 'vuex';
  import notification from '~/components/ui/notification';
  import DefaultHeader from '../components/layout/header/header.vue';
  import DefaultAside from '../components/layout/aside/aside.vue';
  import addIndex from '../components/blocks/addIndex/addIndex.vue';
  import confirmationModal from '../components/blocks/confirmationModal';

  export default {
    head() {
      return {
        link: [
          {
            rel: 'alternate',
            href: this.link('ru'),
            hreflang: 'ru',
          },
          {
            rel: 'alternate',
            href: this.link('en'),
            hreflang: 'en',
          },
          {
            rel: 'alternate',
            href: this.link('ko'),
            hreflang: 'ko',
          },
        ],
        meta: [
          {
            hid: 'og:title',
            name: 'og:title',
            content: 'icex.ch',
          },
          {
            hid: 'og:type',
            name: 'og:type',
            content: 'website',
          },
          {
            hid: 'og:image',
            name: 'og:image',
            content: `${this.host}/static/img/logo.svg`,
          },
          {
            hid: 'og:url',
            name: 'og:url',
            content: `${this.host}/${this.$route.fullPath}`,
          },
          {
            hid: 'og:locale',
            name: 'og:locale',
            content: this.localeForMeta,
          },
          {
            hid: 'og:site_name',
            name: 'og:site_name',
            content: 'icex.ch',
          },
        ],
      };
    },

    data() {
      return {
        host: 'https://app.icex.ch',
      };
    },

    components: {
      notification,
      DefaultHeader,
      DefaultAside,
      addIndex,
      confirmationModal,
    },

    watch: {
      locale: {
        handler(value) {
          document.documentElement.setAttribute('lang', value);
        },
      },
      immediate: true,
    },

    methods: {
      removeNotification(id) {
        return this.$store.dispatch('notifications/removeNotification', id);
      },

      link(locale) {
        const path = this.$route.fullPath.replace(/^.{3}/g, `/${locale}`);
        return this.host + path;
      },
    },

    computed: {
      ...mapState({
        theme: state => state.common.theme,
        menu: state => state.common.menu,
        locale: state => state.common.locale,
        isMobile: state => state.common.isMobile,
        scrollDisabled: state => state.common.scrollDisabled,
        notifications: state => state.notifications,
        localeForMeta: (state) => {
          if (process.browser) {
            return navigator.language || navigator.userLanguage;
          }
          return state.common.locale;
        },

      }),
      layoutScrollClass() {
        if (this.scrollDisabled) {
          if (this.isMobile) {
            return 'layout__content-scroll--disabled-mobile';
          }
          return 'layout__content-scroll--disabled';
        }
        if (this.isMobile) {
          return 'layout__content--mobile';
        }
        return '';
      },
    },

    beforeMount() {
      document.documentElement.setAttribute('lang', this.locale);
    },
  };

</script>

<style lang="sass">
  @import "~assets/sass/vars.sass";
  @import "~bootstrap/scss/bootstrap.scss";

  .layout__container
    // cover all div height with background [ICEX-1112]
    // height: 100%
    min-height: 100vh
    position: relative
    z-index: 2
    padding-top: 3.4rem
    padding-left: 3.4rem
    margin: auto
    transition: 0.3s

    &.__short
      padding-left: 11.2rem

    &.dark
      color: $athens_gray
      border: 1px solid $rhino
      background-color: $mirage

    &.light
      color: $tangaroa
      border: 1px solid $mischka
      background-color: $catskill_white

  .layout__container--mobile
    padding-left: .4rem
    padding-right: .4rem
    padding-top: 3.2rem
    &.__short
      padding-left: .4rem

  .layout__content
    height: 100%
    padding-right: .6rem
    position: relative
    z-index: 0

  .layout__content--mobile
    padding-right: 0

  .layout__content-scroll--disabled
    overflow-y: hidden
    height: calc(100vh - 3.5rem)

  .layout__content-scroll--disabled-mobile
    overflow-y: hidden
    padding: 0 calc(.4rem + 1px)
    position: fixed
    left: 0
    top: calc(3.2rem + 1px)

  .notification-wrap
    position: fixed
    display: flex
    flex-direction: column
    top: 10px
    right: 10px
    z-index: 1000
    @include media-breakpoint-down(md)
      height: auto
      padding: 10px

</style>

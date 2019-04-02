<template lang="pug">
  .header__container

    .header__burger(@click="toggleMenu()" :class="{'__active': menu ==='max'}")
      span
      span
      span

    nuxt-link(:to="{ name: 'lang-indices-indexName', params: { lang: routeLang, currency } }").header__logo
      icon(name="logo").logo__img
      .logo__text index

    .header__settings

      .header__logout(v-if="auth" v-html="$t('user.logout')" @click="logout")
      nuxt-link(:to="{ name: 'lang-auth-personal', params: { lang: routeLang } }" v-if="auth").header__auth
        icon(name="auth" @click="$loader.show()").header__auth-icon
        span.header__auth-name(v-html="$t('user.hello') + ' ' + userData.user_name" @click="$loader.show()")

      nuxt-link(:to="{ name: 'lang-auth-signin', params: { lang: routeLang } }" v-else).header__auth
        icon(name="auth").header__auth-icon

      .header__setting.pointer.--theme(
        v-tooltip.bottom="{ content: $t('tooltip.theme'), container: '.header__setting' }",
        @click="changeTheme()"
      )
        icon(name="theme").header__setting-icon
        switcher(:active="theme === 'dark'", :theme="theme")

      .header__setting.header__locale.pointer.--locale(
        :class="{'opened': showLocales}"
        v-click-outside="closeLocales"
        v-tooltip.bottom="{ content: $t('tooltip.locale'), container: '.header__locale' }"
      )

        .header__locale-wrap(@click.stop="toggleLocales")
          .locale__flag(:class="locale")
          .locale__current(v-html="localeShort")

        ul.locale__list(v-show="showLocales")
          li.locale(v-for="(key, val) in locales" v-show="localeShort !== key.short" )
            nuxt-link(:to="$i18n.translate(val, $route.fullPath)")
              span(@click="selectLocale")
                span.locale__flag(:class="val")
                span.locale__text(v-html="key.full")

      .header__setting.header__currency.pointer.--currency(
        :class="{'opened': showCurrencies}"
        v-click-outside="closeCurrencies"
        v-tooltip.bottom="{ content: $t('tooltip.currency'), container: '.header__currency' }"
      )

        .header__locale-wrap(@click.stop="toggleCurrency")
          .currency__sign(v-html="currencySign")
          .currency__name(v-html="currency")

        .locale__list.__wild( v-show="showCurrencies")
          ul.currency__list
            li.locale.currency(
            v-for="item in currencies",
            v-show="currency !== item.short",
            @click="pushCurrency(item.short)",
            )
              .currency__link.d-flex(@click="selectCurrency")
                span.currency__sign.__small(v-html="item.sign")
                span.currency__name(v-html="item.name")

</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import icon from '~/components/ui/icon.vue';
  import switcher from '~/components/ui/switcher.vue';

  export default {
    name: 'default-header',

    data() {
      return {
        showLocales: false,
        showCurrencies: false,
      };
    },

    components: {
      icon,
      switcher,
    },

    methods: {
      toggleMenu() {
        if (this.menu === 'min') {
          this.$store.dispatch('common/setUserMenuSize', 'max');
        } else {
          /**
           * On the mobile aside menu closed by clicking outside aside menu,
           * see aside.vue hideOnMobile method
           */
          /* eslint-disable */
          if (!this.isMobile) {

            this.$store.dispatch('common/setUserMenuSize', 'min');
          }
          /* eslint-enable */
        }
      },

      changeTheme() {
        if (this.theme === 'light') {
          this.$store.dispatch('common/setUserTheme', 'dark');
        } else {
          this.$store.dispatch('common/setUserTheme', 'light');
        }
      },

      selectLocale() {
        this.toggleLocales();
        this.$loader.show();
      },

      selectCurrency() {
        this.toggleCurrency();
        this.$loader.show();
      },

      toggleLocales() {
        this.toggleHelpScoutVisibility(this.showLocales);
        this.showLocales = !this.showLocales;
        this.showCurrencies = false;
      },

      toggleCurrency() {
        this.toggleHelpScoutVisibility(this.showCurrencies);
        this.showCurrencies = !this.showCurrencies;
        this.showLocales = false;
      },

      closeLocales() {
        this.showLocales = false;
        this.toggleHelpScoutVisibility(true);
      },

      closeCurrencies() {
        this.showCurrencies = false;
        this.toggleHelpScoutVisibility(true);
      },

      toggleHelpScoutVisibility(flag) {
        const node = document.querySelector('#hs-beacon') || null;

        if (node) {
          node.style.visibility = flag ? 'visible' : 'hidden';
        }
      },

      async pushCurrency(currency) {
        await this.$store.dispatch('common/setUserCurrency', currency);
        /**
         * If user is on coin or index page - update query
         */
        if (this.$route.fullPath.includes('coins') || this.$route.fullPath.includes('indices')) {
          this.$router.push({
            query: { ...this.$route.query, currency },
          });
        }
      },

      async logout() {
        const jwt = this.$cookie.get('jwt');

        if (!jwt) {
          return this.$store.dispatch('notifications/addNotification', {
            type: 'error',
            text: 'No JWT token found',
          });
        }

        const response = await this.$store.dispatch('auth/logout', jwt);

        if (response.data.result) {
          this.$cookie.erase('jwt');

          await this.$store.dispatch('notifications/addNotification', {
            type: 'warn',
            text: this.$t('notification.auth.logout'),
          });

          this.$router.push({
            name: 'lang-indices-indexName',
            params: {
              indexName: 'ICEI10',
              lang: this.locale,
            },
            query: {
              currency: this.$route.query.currency,
              interval: this.$route.query.interval,
              with: this.$route.query.with,
            },
          });
        } else {
          await this.$store.dispatch('notifications/addNotification', {
            type: 'error',
            text: `Log out failed. ${Object.values(response.data.errors)[0][0]}`,
          });
        }
        return false;
      },
    },

    computed: {
      ...mapState({
        sub: state => state.chart.sub,
        type: state => state.chart.type,
        menu: state => state.common.menu,
        chartSub: state => state.chart.sub,
        theme: state => state.common.theme,
        locale: state => state.common.locale,
        locales: state => state.common.locales,
        interval: state => state.chart.interval,
        isMobile: state => state.common.isMobile,
        currency: state => state.common.currency,
        currencies: state => state.common.currencies,
        scrollDisabled: state => state.common.scrollDisabled,
        localeShort: (state) => {
          const abbr = state.common.locales[state.common.locale];
          if (!abbr) {
            return 'Eng';
          }
          return abbr.short;
        },
        userData: state => state.auth.data,
        auth: state => state.auth.auth,
      }),

      ...mapGetters({
        isUserLoggedIn: 'auth/isUserLoggedIn',
        currencySign: 'common/currencySign',
      }),

      routeLang() {
        return this.$route.params.lang;
      },

      subChartSwitchDisabled() {
        return this.interval === 'hour'
          || this.interval === 'five_minutes'
          || this.interval === 'minute';
      },

      tooltipContents() {
        return {
          sub: this.sub === 'vol' ? this.$t('tooltip.setChartSubCap') : this.$t('tooltip.setChartSubVol'),
          type: this.type === 'candlestick' ? this.$t('tooltip.setChartTypeLinear') : this.$t('tooltip.setChartTypeCandles'),
        };
      },
    },

    mounted() {
      this.$store.dispatch('common/setUserDefaultParams');
      this.$store.dispatch('common/fetchCurrenciesList');
      if (this.isUserLoggedIn) {
        this.$store.dispatch('indices/fetchAllUserIndices', { id: this.userData.user_id });
      }
    },
  };
</script>

<style lang="sass">
  @import "./header"
</style>

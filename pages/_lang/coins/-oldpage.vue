<template lang="pug">
  div(style="padding-bottom: 80px;")
    .page__container
      h1.page__title.page__title--p-left(v-html="$t('chart.title', {coinName: mainCoin})")

      toggle(:withText="false", :label="$t('tooltip.chart')")
        div(slot="content")
          chart(
          :id="'mainChart'",
          @interval="handleChartIntervalChange($event)",
          )

      template(v-if="!$route.params.coin")
        toggle(
        :withText="false",
        :label="$t('tooltip.chart')",
        )
          div(slot="content")
            component(
            :is="'coins-table'",
            @checked="handleCoinCheck($event)",
            )

      template(v-if="$route.params.coin")
        toggle(
        :withText="false",
        :label="$t('tooltip.exchanges')",
        )
          div.py-2(slot="content")
            component(
            :is="'coin-exchanges-table'",
            :data="exchanges[mainCoin]",
            )

      template(v-if="Object.values(posts).length > 0")
        toggle(
        :withText="false",
        :label="$t('tooltip.news')",
        )
          .container-fluid.py-2(slot="content")
            .row
              template(v-for="post in posts")
                .col-12.col-md-6.col-lg-3
                  nuxt-link.news__link(:to="getPostNuxtLink(post)")
                    span.news__time {{ post.created_at }}
                    .news__image(:style="{ backgroundImage: `url(${post.image})`}")
                    h4.news__title {{ post.title.name }}
              .col-12.col-md-6.col-lg-3
                nuxt-link.news__link(:to="getCoinsFeedNuxtLink()")
                  .d-flex.flex-column.h-100.border.border-secondary.align-items-center.justify-content-center.rounded
                    icon.news__icon(:name="'news'")
                    span.mt-4 Show more

</template>

<script>
  import Vue from 'vue';
  import { mapState, mapGetters } from 'vuex';
  import url from 'url';
  import isEmpty from 'lodash.isempty';
  import capitalize from 'lodash.capitalize';

  import chart from '~/components/blocks/chart';
  import toggle from '~/components/blocks/toggle/toggle.vue';
  import icon from '~/components/ui/icon.vue';

  // eslint-disable-next-line object-curly-newline
  async function fetch({ store, route, error }) {
    const mainCoin = route.params.coin || null;
    const currency = route.query.currency || 'usd';
    const interval = route.query.interval || 'day';
    const { lang } = route.params;

    if (lang !== 'en' && lang !== 'ru') {
      return error({ statusCode: 404, message: 'Page not found. Incorrect language chosen.' });
    }

    const fiats = await store.dispatch('common/fetchCurrenciesList');

    if (
      fiats.result &&
      fiats.data.map(el => el.short).findIndex(el => el === currency.toUpperCase()) === -1
    ) {
      return error({ statusCode: 404, message: 'Page not found. No such currency is supported.' });
    }

    const allowedIntervals = [
      'minute', 'five_minutes', 'hour', 'day', 'week', 'month', undefined,
    ];

    if (allowedIntervals.findIndex(el => el === interval) === -1) {
      return error({ statusCode: 404, message: 'Page not found. Incorrect interval parameter.' });
    }

    // Fetch all coins to validate coin from route params
    const { data } = await store.dispatch('coins/fetchCoinsList');

    // If params coin exists but not found in db throw error
    if (mainCoin && data.findIndex(el => el.toLowerCase() === mainCoin.toLowerCase()) === -1) {
      return error({ statusCode: 404, message: 'Coin not found' });
    }

    await store.dispatch('news/clearPosts');


    return false;
  }

  export default {
    layout: 'base',
    name: 'coin-page',
    head() {
      const coin = capitalize(this.mainCoin);
      const coinShort = this.gridData.find(el => el.name === this.mainCoin).short;

      return {
        title: this.$t('meta.pages.coinChart.title', {
          coin,
          coinShort,
        }),
        meta: [
          {
            hid: 'title',
            name: 'title',
            content: this.$t('meta.pages.coinChart.title', {
              coin,
              coinShort,
            }),
          },
          {
            hid: 'description',
            name: 'description',
            content: this.$t('meta.pages.coinChart.desc', {
              coin,
              coinShort,
            }),
          },

          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.mainCoin,
          },
        ],
        link: [
          {
            hid: 'canonical',
            rel: 'canonical',
            href: this.href,
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

    asyncData({ req, route }) {
      // TODO: fix hardcoded protocol
      const href = req
        ? `https://${req.headers.host}${url.parse(req.url).pathname}`
        : window.location.origin + route.path;
      return {
        posts: {},
        href,
      };
    },

    components: {
      chart,
      toggle,
      icon,
    },

    watch: {
      '$route.params.coin': async function handleCoin() {
        await fetch({
          store: this.$store,
          route: this.$route,
          error: this.$nuxt.error,
          echo: this.$echo,
        });
      },
    },

    methods: {
      getPostNuxtLink(post) {
        return `/${this.$route.params.lang}/feed/${post.category.slug}/${post.id}-${post.title.slug}`;
      },

      getCoinsFeedNuxtLink() {
        return `/${this.$route.params.lang}/feed/tags/${this.mainCoin}`;
      },

      handleChartIntervalChange(interval) {
        return this.$router.push({
          query: Object.assign({}, this.$route.query, { interval }),
        });
      },

      isItemOnChart(name) {
        return this.chartItems.findIndex(el => el.name === name) > -1;
      },

      async handleCoinCheck({ value, name, entity }) {
        if (value) {
          if (this.chartItems.length >= this.maxItemsOnChart) {
            return this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: `You cannot add more than ${this.maxItemsOnChart} items on single chart`,
            });
          }
          return this.$store.dispatch('chart/addItem', { name, entity });
        }
        return this.$store.dispatch('chart/removeItem', { name, entity });
      },
    },

    computed: {
      ...mapState({
        news: state => state.news.posts,
        chartItems: state => state.chart.items,
        currency: state => state.common.currency,
        exchanges: state => state.coins.exchange,
        maxItemsOnChart: state => (state.common.isMobile ? 2 : 3),
        gridCoins: state => state.coins.grid,
        gridData: state => state.coins.grid
          .map((el) => {
            if (!isEmpty(state.coins.data[el])) {
              return Object.assign({}, state.coins.data[el], {
                day_volume: state.coins.data[el].volume['24h'],
              });
            }
            return {};
          }),
      }),
      ...mapGetters({
        mainCoin: 'coins/mainCoin',
        chartCoins: 'chart/chartCoins',
        chartIndices: 'chart/chartIndices',
      }),
    },

    async fetch({ store, route, error }) {
      await fetch({ store, route, error });
    },

    created() {
      if (!this.$route.params.coin) {
        Vue.component(
          'coins-table',
          // The `import` function returns a Promise.
          () => import('~/components/blocks/coinsTable'),
        );
      } else {
        Vue.component(
          'coin-exchanges-table',
          // The `import` function returns a Promise.
          () => import('~/components/blocks/exchangesTable'),
        );
        this.posts = Object.assign({}, this.news);
      }
    },
  };
</script>

<style lang="sass" scoped>
  @import "~assets/sass/pages/coins.sass"
  @import "~assets/sass/page.sass"
</style>

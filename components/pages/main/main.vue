<template lang="pug">
  div.pb-5
    .page__container
      h1.page__title.page__title--p-left(v-html="pageTitle")

      toggle(:withText="false", :label="$t('tooltip.chart')")
        div(slot="content")
          chart(
          :id="'mainChart'",
          :ref="'chart'",
          @interval="handleChartIntervalChange($event)",
          )

      el-tabs(
      id="tabs",
      type="border-card",
      :value="currentTab",
      @tab-click="currentTab = $event.$props.name"
      )
        template(v-if="!isCoinPage && !isNamedPage && indicesTableComponentFetched")
          el-tab-pane(
          :label="$t('mainPage.tabs.indices')",
          name="indices",
          )
            component.py-3(
            :is="'indices-table'",
            :data="indicesData",
            @checked="handleCoinCheck($event)",
            @coins="setCurrentIndex($event)",
            )

        template(v-if="coinsTableComponentFetched && tableCoins.length > 0")
          el-tab-pane(
          name="coins-table",
          :label="coinsTabLabel",
          )
            component(
            :is="'coins-table'",
            :coins="tableCoins",
            @checked="handleCoinCheck($event)",
            @exchanges="setCurrentCoin($event)",
            )

        template(v-if="exchangersTableComponentFetched && currentCoinExchangersData")
          el-tab-pane(
          name="exchangers-table",
          :label="exchangersTabLabel",
          )
            component(
            :is="'coin-exchanges-table'",
            :data="currentCoinExchangersData",
            )

      template(v-if="isCoinPage && Object.values(news).length > 0")
        toggle(
        :withText="false",
        :label="$t('tooltip.news')",
        )
          .container-fluid.py-2(slot="content")
            .row
              template(v-for="post in news")
                .col-12.col-md-6.col-lg-3
                  nuxt-link.news__link(:to="getPostNuxtLink(post)")
                    span.news__time {{ post.created_at }}
                    .news__image(:style="{ backgroundImage: `url(${post.image})`}")
                    h4.news__title {{ post.title.name }}
              .col-12.col-md-6.col-lg-3
                nuxt-link.news__link(:to="getCoinsFeedNuxtLink()")
                  .d-flex.flex-column.h-100.border.border-secondary.align-items-center.justify-content-center.rounded
                    icon.news__icon(:name="'news'")
                    span.mt-4(v-html="$t('mainPage.showMore')")

</template>

<script>
  import Vue from 'vue';
  import { mapState, mapGetters } from 'vuex';
  import url from 'url';
  import get from 'lodash.get';
  import isEmpty from 'lodash.isempty';
  import capitalize from 'lodash.capitalize';

  import chart from '~/components/blocks/chart';
  import toggle from '~/components/blocks/toggle/toggle.vue';
  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import icon from '~/components/ui/icon.vue';

  import i18n from './i18n.json';

  // eslint-disable-next-line object-curly-newline
  async function fetch({ store, route, error, query }) {
    /**
     * Firstly, we validate all params. First validating non-async params (lang, interval),
     * then params which need to be fetched from API (currency, coin name, index name)
     */

    /**
     * By default we support only two languages: english and russian
     * In future we will expand supported languages, so will fetch them from API
     */
    const { lang } = route.params;

    if (lang !== 'en' && lang !== 'ru') {
      return error({ statusCode: 404, message: 'Page not found. Incorrect language chosen.' });
    }

    /**
     * Validate chart interval parameter
     * If undefined - set it as 'day' by default
     * @type {string} Interval - chart parameter
     */
    const interval = query.interval || 'day';

    const allowedIntervals = [
      '5-seconds',
      '15-seconds',
      '30-seconds',
      'minute',
      '5-minutes',
      'hour',
      'day',
      'week',
      'month',
      undefined,
    ];

    if (allowedIntervals.findIndex(el => el === interval) === -1) {
      return error({ statusCode: 404, message: 'Page not found. Incorrect interval parameter.' });
    }

    /**
     * Validate currency parameter
     * If undefined - set it as 'USD' by default
     * @type {string}
     */
    const currency = query.currency || 'USD';
    const fiats = await store.dispatch('common/fetchCurrenciesList');

    /**
     * If we have no response from API or we don't support such currency - throw error
     * We should uppercase parameter because API return all currencies short name in uppercase too
     */
    if (
      fiats.data.result &&
      fiats.data.data.map(el => el.short).findIndex(el => el === currency.toUpperCase()) === -1
    ) {
      return error({ statusCode: 404, message: 'Page not found. No such currency is supported.' });
    }

    /**
     * Define on which page we are currently on
     * @type {string}
     */
    const pageType = route.fullPath.includes('indices') ? 'index' : 'coin';

    /**
     * Below we define some common parameters for both pages
     */

    /**
     * Fetch parameter
     * Define language of data served from API
     * @type {string}
     */
    const locale = store.state.common.locales[route.params.lang].desc || 'eng';

    const params = {
      convert: currency,
      detail: true,
      description: locale,
    };

    /**
     * User token. User's indices being fetched according to this token.
     * @type {string}
     */
    const token = get(store.state.auth, 'data.token', '');

    /**
     * Perform common actions
     * TODO: deprecate this first action
     */
    store.dispatch('indices/resetActiveIndices');
    store.dispatch('coins/clearGridCoins');
    store.dispatch('chart/clearItems');
    store.dispatch('news/clearPosts');
    store.dispatch('common/setUserCurrency', currency);

    if (pageType === 'index') {
      /**
       * Define active index by default. If there is no such index - first one from API will be active
       * @type {string}
       */
      const mainIndex = route.params.indexName || '';
      /**
       * Additional indices which aren't on chart by default but their data should be fetched
       * @type {Array}
       */
      const additionalIndices = (route.query.with && route.query.with.split(',')) || [];

      /**
       * Fetch common and user's indices together
       */
      const { data } = await store.dispatch('indices/fetchAllIndices', {
        token,
      });

      if (!data.result) {
        return error({ statusCode: 503, message: 'Cannot fetch indices data. API is unavailable now.' });
      }

      const indices = data.data.map(el => el.name);
      /**
       * Validate mainIndex value if exists
       */
      if (mainIndex && indices
        .findIndex(el => el.toString().toLowerCase() === mainIndex.toString().toLowerCase()) === -1) {
        return error({ statusCode: 404, message: 'Index not found' });
      }

      const promises = mainIndex
        ? [mainIndex, ...additionalIndices].map(el => store.dispatch('indices/fetchIndexData', { name: el, params }))
        : indices.map(el => store.dispatch('indices/fetchIndexData', { name: el, params }));
      const response = await Promise.all(promises);
      const gridIndices = response
        .filter(el => el.data.result)
        .map(el => el.data.data.pop());

      if (gridIndices.length === 0) {
        return error({ statusCode: 503, message: 'No indices data received. API is unavailable now.' });
      }

      gridIndices.forEach((index) => { // eslint-disable-line no-shadow
        store.dispatch('indices/setActiveIndex', index.name);
        index.coins.forEach(coin => store.dispatch('coins/setCoinData', { // eslint-disable-line no-shadow
          name: coin.name,
          data: coin,
        }));
      });
      store.dispatch('indices/setChosenIndex', gridIndices[0].name);
      store.dispatch('chart/addItem', { name: gridIndices[0].name, entity: 'index' });
    } else {
      /**
       * Define active coin by default. If there is no such coin - first one from API will be active
       * usually it's a bitcoin
       * @type {string}
       */
      const mainCoin = route.params.coin || '';

      /**
       * Parameters for news fetching
       * @type {Object}
       */
      const newsParams = {
        limit: 3,
        status: 'published',
        detail: true,
        lang: locale,
        tags: mainCoin,
        page: 1,
      };

      const promises = [];

      if (mainCoin) {
        promises.push(store.dispatch('coins/fetchCoinData', { name: mainCoin, params }));
        promises.push(store.dispatch('coins/fetchCoinExchange', { name: mainCoin, params }));
        promises.push(store.dispatch('news/fetchAll', newsParams));
      } else {
        promises.push(store.dispatch('coins/fetchAllCoinsData', params));
      }

      const [response] = await Promise.all(promises);

      const gridCoins = response.data.data.map(el => el.name);

      gridCoins.forEach(el => store.dispatch('coins/setGridCoin', el));

      store.dispatch('chart/addItem', { name: gridCoins[0], entity: 'coin' });
    }

    return true;
  }

  export default {
    layout: 'base',
    name: 'main-page',
    head() {
      const meta = [];
      let title = null;

      if (this.isCoinPage) {
        const coin = capitalize(this.mainCoin); // Ex: "Bitcoin"
        const coinShort = this.mainCoin && this.gridData
          .find(el => el.name === this.mainCoin).short; // Ex: "BTC"

        title = this.$t('meta.pages.coinChart.title', {
          coin,
          coinShort,
        });

        meta.push(
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
        );
      } else {
        const count = this.indexCoins.length;
        const index = this.chosen;

        title = this.$t('meta.pages.indexChart.title', {
          index: this.chosen,
        });

        meta.push(
          {
            hid: 'title',
            name: 'title',
            content: this.$t('meta.pages.indexChart.title', {
              index,
            }),
          },
          {
            hid: 'description',
            name: 'description',
            content: this.$t('meta.pages.indexChart.desc', {
              index,
              count,
            }),
          },

          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: index,
          },
        );
      }


      return {
        title,
        meta,
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
    async asyncData({ req, route }) {
      // TODO: fix hardcoded protocol
      const href = req
        ? `https://${req.headers.host}${url.parse(req.url).pathname}`
        : window.location.origin + route.path;

      return {
        /**
         * Name of index whose coins show in tab
         */
        currentIndex: route.params.indexName || '',

        /**
         * Name of coin whose exchanges show in tab
         */
        currentCoin: route.params.coin || '',

        isCoinPage: route.fullPath.includes('coins'),

        /**
         * Define is current page have coin name or index name as parameter
         */
        isNamedPage: !!route.params.indexName || !!route.params.coin,

        /**
         * Define visibility of each tab-pane it tabs component
         */
        showIndicesTab: true,
        showCoinsTab: true,
        showExchangersTab: true,

        coinsTableComponentFetched: false,
        exchangersTableComponentFetched: false,
        indicesTableComponentFetched: false,

        currentTab: 'indices',
        showCoinsListTitle: true,
        href,

        /**
         * Contains news about coin which is in route params
         */
        // posts: Object.assign({}, this.news),
        posts: {},
      };
    },

    components: {
      chart,
      toggle,
      inputCheckbox,
      icon,
    },

    watch: {
      '$route.params.indexName': async function routeIndexHandler() {
        await fetch({
          store: this.$store,
          route: this.$route,
          error: this.$nuxt.error,
          query: this.$route.query,
        });
      },
      '$route.params.coin': async function routeCoinHandler() {
        await fetch({
          store: this.$store,
          route: this.$route,
          error: this.$nuxt.error,
          query: this.$route.query,
        });
      },
      '$route.query.currency': async function routeCoinHandler() {
        await fetch({
          store: this.$store,
          route: this.$route,
          error: this.$nuxt.error,
          query: this.$route.query,
        });
      },
    },

    methods: {
      async handleCoinCheck({ name, value, entity }) {
        if (value) {
          if (this.chartItems.length >= this.maxItemsOnChart) {
            return this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: `You cannot add more than ${this.maxItemsOnChart} items on single chart`,
            });
          }

          const { interval } = this.$refs.chart;
          if (
            (interval === '30s' ||
            interval === '15s' ||
            interval === '5s') &&
            entity === 'index' &&
            name !== 'ICEI10'
          ) {
            return this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: `User indices are not available in ${interval} interval. Please, switch to larger interval.`,
            });
          }
          return this.$store.dispatch('chart/addItem', { name, entity });
        }
        return this.$store.dispatch('chart/removeItem', { name, entity });
      },

      getPostNuxtLink(post) {
        return `/${this.$route.params.lang}/feed/${post.category.slug}/${post.id}-${post.title.slug}`;
      },

      getCoinsFeedNuxtLink() {
        return `/${this.$route.params.lang}/feed/tags/${this.mainCoin}`;
      },

      handleChartIntervalChange(interval) {
        return this.$router.replace({
          query: {
            interval,
            currency: this.currency,
          },
        });
      },

      isItemOnChart(name) {
        return this.chartItems.findIndex(el => el.name === name) > -1;
      },

      async loadIndicesTableComponent() {
        if (!this.indicesTableComponentFetched) {
          await Vue.component(
            'indices-table',
            // The `import` function returns a Promise.
            async () => import(/* webpackChunkName: "indices-table" */ './_indicesTable.vue'),
          );
          this.indicesTableComponentFetched = true;
        }
      },

      async loadCoinsTableComponent() {
        if (!this.coinsTableComponentFetched) {
          await Vue.component(
            'coins-table',
            // The `import` function returns a Promise.
            async () => import(/* webpackChunkName: "coins-table" */ '~/components/blocks/coinsTable'),
          );
          this.coinsTableComponentFetched = true;
        }
      },

      async loadCoinExchangesTableComponent() {
        if (!this.exchangersTableComponentFetched) {
          await Vue.component(
            'coin-exchanges-table',
            // The `import` function returns a Promise.
            async () => import(/* webpackChunkName: "exchanges-table" */ '~/components/blocks/exchangesTable'),
          );
          this.exchangersTableComponentFetched = true;
        }
      },

      async setCurrentIndex(index) {
        await this.loadCoinsTableComponent();

        this.currentIndex = index;
        this.currentTab = 'coins-table';
      },

      async setCurrentCoin({ coin }) {
        await this.loadCoinExchangesTableComponent();

        await this.$store.dispatch('coins/fetchCoinExchange', {
          name: coin,
          params: {
            convert: this.currency,
            detail: true,
          },
        });

        this.currentCoin = coin;
        this.currentTab = 'exchangers-table';
      },
    },

    computed: {
      ...mapState({
        indicesData: state => state.indices.data,
        chosen: state => state.indices.chosen,
        activeIndices: state => state.indices.active,
        indexData: state => state.indices.active.map(index => state.indices.data[index]),
        coinsData: state => state.coins.data,
        indexCoins: (state) => {
          const coins = get(state.indices.data, `${state.indices.chosen}.coins`, []);

          return coins.map(el => el.name);
        },

        // to chart
        news: state => state.news.posts,
        exchanges: state => state.coins.exchange,
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
        currency: state => state.common.currency,
        chartItems: state => state.chart.items,
        maxItemsOnChart: state => (state.common.isMobile ? 2 : 3),
        coinsList: state => state.coins.list.all,
      }),

      ...mapGetters({
        mainCoin: 'coins/mainCoin',
        chartCoins: 'chart/chartCoins',
        chartIndices: 'chart/chartIndices',
        currencySign: 'common/currencySign',
      }),

      pageTitle() {
        if (this.isCoinPage) {
          return this.$t('mainPage.coins.title', { coin: this.mainCoin });
        }
        return this.$t('mainPage.indices.title');
      },

      tableCoins() {
        if (this.isCoinPage) {
          return this.coinsList;
        }
        const index = get(this.indicesData, this.currentIndex, null);

        if (index) {
          return index.coins.map(el => el.name);
        }
        return [];
      },

      currentCoinExchangersData() {
        if (this.currentCoin) {
          return get(this.exchanges, this.currentCoin, null);
        }
        return null;
      },

      exchangersTabLabel() {
        return this.$t('mainPage.tabs.exchangers', { coin: capitalize(this.currentCoin) });
      },

      coinsTabLabel() {
        return this.$t('mainPage.tabs.coins', { index: this.currentIndex });
      },
    },
    // eslint-disable-next-line object-curly-newline
    async fetch({ store, route, error, query }) {
      // eslint-disable-next-line object-curly-newline
      await fetch({ store, route, error, query });
    },
    async created() {
      if (this.isCoinPage && this.isNamedPage) {
        this.loadCoinExchangesTableComponent();
        this.currentTab = 'exchangers-table';
      } else if (this.isCoinPage && !this.isNamedPage) {
        this.loadCoinsTableComponent();
        this.currentTab = 'coins-table';
      } else if (!this.isCoinPage && this.isNamedPage) {
        this.loadCoinsTableComponent();
        this.currentTab = 'coins-table';
      } else if (!this.isCoinPage && !this.isNamedPage) {
        this.loadIndicesTableComponent();
        this.currentTab = 'indices';
      }
    },
    i18n,
  };
</script>

<style lang="scss">
  @import "./main.sass";
</style>

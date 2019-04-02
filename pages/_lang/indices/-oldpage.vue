<template lang="pug">
  div
    .page__container
      h1.page__title.page__title--p-left(v-if="!$route.params.index" v-html="$t('indices.title')")

      toggle(:withText="false", :label="$t('tooltip.chart')")
        div(slot="content")
          chart(
          :id="'mainChart'",
          @interval="handleChartIntervalChange($event)",
          )

      el-tabs(type='border-card')
        el-tab-pane(label='Indices')
          .container-fluid
            .row
              template(v-for="index in indexContent")
                .col-12.col-md-6
                  .d-flex.justify-content-between
                    p {{ index.name }}
                    span {{ currencySign + index.price.value }}
                    span {{ index.change.week }}
                    span {{ index.change.month }}
                    .index__settings.d-flex.justify-content-between
                      input-checkbox(
                      v-if="!disabled && showChartBtn"
                      :value="checked",
                      :id="index.name",
                      :label="index.name",
                      @input="emitCheck($event)",
                      v-tooltip.bottom="{ content: $t('tooltip.chart')}"
                      ).__withoutCheckbox
                        icon(name="tochart", slot="icon", :class="{'disabled': !checked}").setting__coin

        el-tab-pane(v-if="showCoinsTab", label='Coins')
          coins-table(:coins="indexCoins")
        el-tab-pane(v-if="showExchangersTab", label='Exchangers')
          //- exchanges-table(:data="")

</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import url from 'url';
  import get from 'lodash.get';

  import indexData from '~/components/blocks/indexData';
  import indexGrid from '~/components/blocks/indexGrid';

  import coinData from '~/components/blocks/coinData';
  import dataGrid from '~/components/blocks/dataGrid';

  import chart from '~/components/blocks/chart';
  import toggle from '~/components/blocks/toggle/toggle.vue';

  import coinsTable from '~/components/blocks/coinsTable';
  import exchangesTable from '~/components/blocks/exchangesTable';

  // eslint-disable-next-line object-curly-newline
  async function fetch({ store, route, error, query }) {
    store.dispatch('common/setLoaderStatus', true);
    const token = get(store.state.auth, 'data.token', null);
    const mainIndex = route.params.indexName || null;
    const additionalIndices = (route.query.with && route.query.with.split(',')) || [];
    const currency = query.currency || 'usd';
    const interval = query.interval || 'day';
    const lang = route.params.lang || 'ru';

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

    const locale = store.state.common.locales[route.params.lang].desc || 'eng';

    const params = {
      convert: currency,
      detail: true,
      description: locale,
    };

    const { data } = await store.dispatch('indices/fetchAllIndices', {
      token,
    });

    const indices = data.map(el => el.name);

    if (mainIndex && indices.findIndex(el => el.toLowerCase() === mainIndex.toLowerCase()) === -1) {
      return error({ statusCode: 404, message: 'Index not found' });
    }

    async function fetchIndexData(name) {
      return store.dispatch('indices/fetchIndexData', {
        name,
        params,
      });
    }

    const promises = mainIndex
      ? [mainIndex, ...additionalIndices].map(fetchIndexData)
      : indices.map(fetchIndexData);

    const response = await Promise.all(promises);
    const gridIndices = response.filter(el => el.data && el.result).map(el => el.data.pop());

    store.dispatch('indices/resetActiveIndices');
    store.dispatch('chart/clearItems');
    store.dispatch('common/setUserCurrency', currency);
    gridIndices.forEach((index) => { // eslint-disable-line no-shadow
      store.dispatch('indices/setActiveIndex', index.name);
      index.coins.forEach(coin => store.dispatch('coins/setCoinData', { // eslint-disable-line no-shadow
        name: coin.name,
        data: coin,
      }));
    });
    store.dispatch('indices/setChosenIndex', gridIndices[0].name);
    store.dispatch('chart/addItem', { name: gridIndices[0].name, entity: 'index' });

    return true;
  }

  export default {
    layout: 'base',
    name: 'index-page',
    head() {
      const index = this.chosen;
      const count = this.indexCoins.length;
      return {
        title: this.$t('meta.pages.indexChart.title', {
          index: this.chosen,
        }),
        meta: [
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
        showCoinsTab: true,
        showExchangersTab: true,
        showCoinsListTitle: true,
        href,
      };
    },

    components: {
      indexData,
      indexGrid,

      coinData,
      dataGrid,

      chart,
      toggle,

      coinsTable,
      exchangesTable,
    },

    watch: {
      '$route.params.index': async function routeIndexHandler() {
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
          return this.$store.dispatch('chart/addItem', { name, entity });
        }
        return this.$store.dispatch('chart/removeItem', { name, entity });
      },

      handleChartIntervalChange(interval) {
        return this.$router.push({
          query: Object.assign({}, this.$route.query, { interval }),
        });
      },

      isItemOnChart(name) {
        return this.chartItems.findIndex(el => el.name === name) > -1;
      },

      handleIndexChosen(index) {
        this.$store.dispatch('indices/setChosenIndex', index);
        this.indexCoins.map(name => this.$store.dispatch('coins/fetchCoinData', {
          name,
          params: {
            convert: this.currency,
          },
        }));
      },
    },

    computed: {
      ...mapState({
        chosen: state => state.indices.chosen,
        activeIndices: state => state.indices.active,
        indexContent: state => state.indices.active.map(index => state.indices.data[index]),
        coinsData: state => state.coins.data,
        indexCoins: (state) => {
          const coins = get(state.indices.data, `${state.indices.chosen}.coins`, []);

          return coins.map(el => el.name);
        },

        // to chart
        currency: state => state.common.currency,
        chartItems: state => state.chart.items,
        maxItemsOnChart: state => (state.common.isMobile ? 2 : 3),
      }),

      ...mapGetters({
        currencySign: 'common/currencySign',
      }),

      gridData() {
        return Object.values(this.indexCoins).map(el => this.coinsData[el]);
      },
    },

    // eslint-disable-next-line object-curly-newline
    async fetch({ store, route, error, query }) {
      // eslint-disable-next-line object-curly-newline
      await fetch({ store, route, error, query });
    },
  };
</script>

<style lang="scss">
  @import "~assets/sass/pages/indices.sass";
</style>

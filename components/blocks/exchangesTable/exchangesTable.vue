<template lang="pug">
  div

    sortDropdown.d-sm-none.mb-2(
    :activeSortKey="sortBy",
    :activeSortAsc="ascending",
    :options="sortOptions",
    @value="sortTable({ key: $event.key, order: $event.order })"
    )

    table.ex-table
      thead
        tr.d-none.d-sm-table-row.d-lg-none.border-bottom.border-secondary
          th(
          @click.stop="sortTable({ key: 'exchanger' })",
          :class="[getHeadingClass('exchanger'), 'no-select']",
          ) {{ $t('exchangersTable.exchange') }}
          th(
          @click.stop="sortTable({ key: 'price' })",
          :class="[getHeadingClass('price'), 'no-select']",
          ) {{ $t('exchangersTable.lastTradePrice', { currencySign }) }}
          th(
          @click.stop="sortTable({ key: 'totalVolume' })",
          :class="[getHeadingClass('totalVolume'), 'no-select']",
          ) {{ $t('exchangersTable.totalVolume', { short }) }}
        tr.d-none.d-lg-table-row.border-bottom.border-secondary
          th(
          rowspan="2",
          :class="[getHeadingClass('exchanger'), 'no-select']",
          @click.stop="sortTable({ key: 'exchanger' })",
          ) {{ $t('exchangersTable.exchange') }}
          th(
          rowspan="2",
          :class="[getHeadingClass('pair'), 'no-select']",
          @click.stop="sortTable({ key: 'pair' })",
          ) {{ $t('exchangersTable.pair') }}
          th(colspan="3", rowspan="2")
            table.ex-table
              tbody
                tr
                  th.text-center(colspan=3)  {{ $t('exchangersTable.lastTrade') }}
                tr
                  th(
                  @click.stop="sortTable({ key: 'price' })",
                  :class="[getHeadingClass('price'), 'no-select']",
                  ) {{ $t('exchangersTable.lastTradePrice', { currencySign }) }}
                  th(
                  @click.stop="sortTable({ key: 'sum' })",
                  :class="[getHeadingClass('sum'), 'no-select']",
                  ) {{ $t('exchangersTable.lastTradeSum', { currencySign }) }}
                  th(
                  @click.stop="sortTable({ key: 'volume' })",
                  :class="[getHeadingClass('volume'), 'no-select']",
                  ) {{ $t('exchangersTable.lastTradeVolume', { short }) }}
          th(colspan="3", rowspan="2")
            table.ex-table
              tbody
                tr
                  th.text-center(colspan=3)  {{ $t('exchangersTable.total') }}
                tr
                  th(
                  @click.stop="sortTable({ key: 'totalDemandUsd' })",
                  :class="[getHeadingClass('totalDemandUsd'), 'no-select']",
                  ) {{ $t('exchangersTable.totalDemand', { currencySign }) }}
                  th(
                  @click.stop="sortTable({ key: 'totalOffer' })",
                  :class="[getHeadingClass('totalOffer'), 'no-select']",
                  ) {{ $t('exchangersTable.totalOffer', { short }) }}
                  th(
                  @click.stop="sortTable({ key: 'totalVolume' })",
                  :class="[getHeadingClass('totalVolume'), 'no-select']",
                  ) {{ $t('exchangersTable.totalVolume', { currencySign }) }}
      tbody
        tr.d-sm-none.border-bottom.border-secondary.ex-table__row(
        v-for="item in exchangers",
        :class="priceSortedClasses[`${item.exchanger}_${item.pair}`]"
        )
          td.py-2(colspan="2")
            table.ex-table
              tbody
                tr
                  td
                    span {{ $t('exchangersTable.exchange') }}
                  td
                    a(:href="item.url", target="_blank").ex-table__exchanger {{ item.exchanger }}
                tr
                  td
                    span {{ $t('exchangersTable.pair') }}
                  td
                    span {{ item.pair }}

                tr
                  td
                    span {{ $t('exchangersTable.lastTradePrice', { currencySign }) }}
                  td
                    numbers(:value="item.price", :decimals="2", :animate="animate")

                tr
                  td
                    span {{ $t('exchangersTable.lastTradeSum', { short }) }}
                  td
                    numbers(:value="item.sum", :decimals="6", :animate="animate")

                tr
                  td
                    span {{ $t('exchangersTable.lastTradeVolume', { short }) }}
                  td
                    numbers(:value="item.volume", :decimals="6", :animate="animate")

                tr
                  td
                    span {{ $t('exchangersTable.totalDemand', { currencySign }) }}
                  td
                    numbers(:value="item.totalDemandUsd", :decimals="2", :animate="animate")

                tr
                  td
                    span {{ $t('exchangersTable.totalOffer', { short }) }}
                  td
                    numbers(:value="item.totalOffer", :decimals="2", :animate="animate")

                tr
                  td
                    span {{ $t('exchangersTable.totalVolume', { currencySign }) }}
                  td
                    numbers(:value="item.totalVolume", :decimals="0", :animate="animate")
        tr.d-none.d-sm-table-row.d-lg-none.ex-table__row.border-bottom.border-secondary(
        v-for="item in exchangers"
        :class="priceSortedClasses[`${item.exchanger}_${item.pair}`]"
        )
          td.py-2(colspan="3")
            table.ex-table
              tbody
                tr
                  td(colspan="3")
                    a(:href="item.url", target="_blank").ex-table__exchanger {{ item.exchanger }}
                tr
                  td(rowspan="3").ex-table__pair {{ item.pair }}
                  td
                    table.ex-table
                      tbody
                        tr
                          td
                            span {{ $t('exchangersTable.lastTradePrice', { currencySign }) }}
                            numbers(:value="item.price", :decimals="2", :animate="animate")
                        tr
                          td
                            span {{ $t('exchangersTable.lastTradeSum', { currencySign }) }}
                            numbers(:value="item.sum", :decimals="6", :animate="animate")
                        tr
                          td
                            span {{ $t('exchangersTable.lastTradeVolume', { short }) }}
                            numbers(:value="item.volume", :decimals="6", :animate="animate")
                  td
                    table.ex-table
                      tbody
                        tr
                          td
                            span {{ $t('exchangersTable.totalDemand', { currencySign }) }}
                            numbers(:value="item.totalDemandUsd", :decimals="2", :animate="animate")
                        tr
                          td
                            span {{ $t('exchangersTable.totalOffer', { currencySign }) }}
                            numbers(:value="item.totalOffer", :decimals="2", :animate="animate")
                        tr
                          td
                            span {{ $t('exchangersTable.totalVolume', { short }) }}
                            numbers(:value="item.totalVolume", :decimals="0", :animate="animate")
        tr.d-none.d-lg-table-row.border-bottom.border-secondary.ex-table__row(
        v-for="item in exchangers",
        :class="priceSortedClasses[`${item.exchanger}_${item.pair}`]"
        )
          td.py-2
            a(:href="item.url", target="_blank").ex-table__exchanger {{ item.exchanger }}
          td.ex-table__pair {{ item.pair }}
          td
            numbers(:value="item.price", :decimals="2", :animate="animate")
          td
            numbers(:value="item.sum", :decimals="6", :animate="animate")
          td
            numbers(:value="item.volume", :decimals="6", :animate="animate")
          td
            numbers(:value="item.totalDemandUsd", :decimals="2", :animate="animate")
          td
            numbers(:value="item.totalOffer", :decimals="2", :animate="animate")
          td
            numbers(:value="item.totalVolume", :decimals="0", :animate="animate")


</template>

<script>
  import Vue from 'vue';
  import Raven from 'raven-js';
  import { mapGetters, mapState } from 'vuex';
  import get from 'lodash.get';
  import sortDropdown from '~/components/ui/dropdown/sort.vue';
  import numbers from '~/components/ui/numbers.vue';

  export default {
    name: 'coin-exchanges-table',
    props: {
      /**
       * Receives raw exchanges data from API
       * Ex: { poloniex: { name, trade_pairs: [], url }, ... }
       */
      data: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        // Enable background animations of numbers component on value change
        animate: true,

        // Sort ascending by default
        ascending: false,

        // Sort table by price by default
        sortBy: 'price',

        priceSortedLength: 0,

        // Source data for table
        exchangers: [],

        // Contains pairs ['exchanger:pair'] : unix, used to throttle socket events
        lastUpdate: {},

        // Used for sorting dropdown on mobiles
        sortOptions: [
          {
            key: 'exchanger',
            title: this.$t('exchangersTable.exchange'),
            buttons: [
              { text: 'Z &rarr; A', icon: null, ascending: true },
              { text: 'A &rarr; Z', icon: null, ascending: false },
            ],
          },
          {
            key: 'pair',
            title: this.$t('exchangersTable.pair'),
            buttons: [
              { text: 'Z &rarr; A', icon: null, ascending: true },
              { text: 'A &rarr; Z', icon: null, ascending: false },
            ],
          },
          {
            key: 'price',
            title: this.$t('exchangersTable.lastTradePrice', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'sum',
            title: this.$t('exchangersTable.lastTradeSum', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'volume',
            title: this.$t('exchangersTable.lastTradeVolume', { short: this.short }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'totalDemand',
            title: this.$t('exchangersTable.totalDemand', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'totalOffer',
            title: this.$t('exchangersTable.totalOffer', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'totalVolume',
            title: this.$t('exchangersTable.totalVolume', { short: this.short }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
        ],

        // Delay between apply data update in ms
        updateInterval: 1000,

        // For internal usage only
        benchmark: {},
      };
    },
    components: {
      numbers,
      sortDropdown,
    },
    watch: {
      data: {
        handler(value) {
          /**
           * When we switching between coins this table won't remount
           * So we need explicitly leave all channels and clear some data
           */
          this.wipeAllComponentData();

          /**
           * Convert raw data from prop into suitable array
           */
          this.convertDataToConsumableArray(value);

          /**
           * Perform sorting by default
           */
          this.sortTable({ key: this.sortBy });

          this.priceSortedLength = Math.floor(this.exchangers.length / 5);

          /**
           * And subscribe on each exchanger-pair socket channel
           * to get real time updates
           */
          this.joinAll();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      performBenchmarking(timeout) {
        function median(values) {
          values.sort((a, b) => a - b);
          const half = Math.floor(values.length / 2);

          if (values.length % 2) {
            return values[half];
          }
          return (values[half - 1] + values[half]) / 2.0;
        }
        let counter = 0;
        Vue.set(this, 'lastUpdate', {});
        this.socketChannelsList.forEach((ch) => {
          this.leaveExchangerChannel({
            exchanger: ch.exchanger,
            pair: ch.pair,
          });
        });
        this.socketChannelsList.forEach((ch) => {
          Vue.set(this.lastUpdate, `${ch.exchanger}:${ch.pair}`, Date.now());
          Vue.set(this.benchmark, ch.exchanger, []);
          this.subscribeOnExchangerChannel({
            exchanger: ch.exchanger,
            pair: ch.pair,
            cb: () => {
              const time = Date.now();
              Vue.set(
                this.benchmark[ch.exchanger],
                this.benchmark[ch.exchanger].length,
                time - this.lastUpdate[`${ch.exchanger}:${ch.pair}`],
              );
              Vue.set(this.lastUpdate, `${ch.exchanger}:${ch.pair}`, time);
              setTimeout(() => {
                this.leaveExchangerChannel({
                  exchanger: ch.exchanger,
                  pair: ch.pair,
                });
                counter += 1;
                if (counter === this.socketChannelsList.length) {
                  const a = Object.keys(this.benchmark).reduce((acc, el) => {
                    acc[el] = {
                      events: this.benchmark[el].length,
                      maxDelay: Math.max(...this.benchmark[el]),
                      average: (this.benchmark[el]
                        .reduce((c, e) => { c += e; return c; }, 0) / this.benchmark[el].length),
                      median: median(this.benchmark[el]),
                    };
                    return acc;
                  }, {});
                  console.table(a); // eslint-disable-line
                }
              }, timeout);
            },
          });
        });
      },
      /**
       * Returns CSS classes to set triangle after th inner text on active column
       * TODO: consider more proper way to define th classes
       * @param key
       * @return {string}
       */
      getHeadingClass(key) {
        if (this.sortBy === key) {
          if (this.ascending) {
            return 'ex-table__th ex-table__th--asc';
          }
          return 'ex-table__th ex-table__th--desc';
        }
        return 'ex-table__th';
      },
      convertDataToConsumableArray(value) {
        this.exchangers = Object.values(value).reduce((acc, exchanger) => {
          exchanger.trade_pairs.forEach((pair) => {
            /**
             * IMPORTANT NOTE: We MUST keep object structure as socket sends to us
             * to prevent some useless job like object formatting on each callback
             */
            acc.push({
              url: exchanger.url,
              exchanger: exchanger.name,
              pair: pair.name,
              price: pair.lastTradeData.price,
              sum: pair.lastTradeData.sum,
              volume: pair.lastTradeData.volume,
              totalDemandUsd: pair.totalDemandUsd,
              totalOffer: pair.totalOffer,
              totalVolume: pair.totalVolume,
            });
          });
          return acc;
        }, []);
      },
      sortTable({ key, order }) {
        /**
         * If we didn't set order explicitly look on sorting key change
         * If same - change sorting order, if not - keep old value
         * @type {boolean}
         */
        if (typeof order !== 'undefined') {
          this.ascending = order;
        } else {
          this.ascending = this.sortBy === key
            ? !this.ascending
            : this.ascending;
        }

        /**
         * Disable background blinking of numbers. We enable it in socket callback
         * because if we enable it in the end of this method animations still be there
         * @type {boolean}
         */
        this.animate = false;
        this.sortBy = key;
        this.exchangers = this.exchangers
          .slice()
          .sort((a, b) => {
            let f = {};

            switch (key) {
              case 'exchanger':
              case 'pair':
                f = { a: a[key], b: b[key] };
                break;
              default:
                f = { a: parseFloat(a[key]), b: parseFloat(b[key]) };
                break;
            }

            if (this.ascending) {
              return f.a < f.b ? 1 : -1;
            }
            return f.a > f.b ? 1 : -1;
          });
      },
      subscribeOnExchangerChannel({ exchanger, pair, cb }) {
        const channel = `exchanges:${exchanger}:${pair}`;
        return this.$echo
          .channel(channel)
          .listen('.update', e => cb({ event: e, exchanger, pair }));
      },
      leaveExchangerChannel({ exchanger, pair, cb }) {
        const channel = `exchanges:${exchanger}:${pair}`;
        this.$echo.leave(channel);
        return cb && cb();
      },
      updateLastTrade({ event, exchanger, pair }) {
        const data = JSON.parse(event);
        const time = Date.now();

        /**
         * If it's passed more than updateInterval milliseconds, update exchanger data
         */
        if (time - this.lastUpdate[`${exchanger}:${pair}`] >= this.updateInterval) {
          /**
           * Enable animations in case we disable it in sort method
           */
          this.animate = true;

          const index = this.exchangers
            .findIndex(el => el.exchanger === exchanger && el.pair === pair);

          /**
           * We preserve exchanger name, url and pair via Object.assign()
           */
          Vue.set(this.exchangers, index, Object.assign({}, this.exchangers[index], {
            price: this.rate * data.price,
            sum: this.rate * data.sum,
            volume: this.rate * data.volume,
            totalDemandUsd: this.rate * data.totalDemandUsd,
            totalOffer: this.rate * data.totalOffer,
            totalVolume: this.rate * data.totalVolume,
          }));
          Vue.set(this.lastUpdate, `${exchanger}:${pair}`, time);
        }
      },
      wipeAllComponentData() {
        this.leaveAll();
        Vue.set(this, 'lastUpdate', {});
        Vue.set(this, 'exchangers', []);
      },
      joinAll() {
        Raven.captureBreadcrumb({
          message: 'Joined exchanges socket channels',
          category: 'exchanges table',
          level: 'info', // error, warning, info, or debug.
          data: { channels: this.socketChannelsList },
        });
        this.socketChannelsList.forEach((ch) => {
          /**
           * Save subscription time to use it in events filtering
           */
          Vue.set(this.lastUpdate, `${ch.exchanger}:${ch.pair}`, Date.now());

          this.subscribeOnExchangerChannel({
            exchanger: ch.exchanger,
            pair: ch.pair,
            cb: this.updateLastTrade,
          });
        });

        this.$nextTick(() => {
          this.animate = true;
        });
      },
      leaveAll() {
        this.animate = false;
        Raven.captureBreadcrumb({
          message: 'Left exchanges socket channels',
          category: 'exchanges table',
          level: 'info', // error, warning, info, or debug.
          data: { channels: this.socketChannelsList },
        });
        return this.socketChannelsList.forEach(ch => this.leaveExchangerChannel({
          exchanger: ch.exchanger,
          pair: ch.pair,
        }));
      },
    },
    computed: {
      ...mapState({
        /**
         * @param state
         * @return {string} Short coin name - BTC, ETH
         */
        short: (state) => {
          if (state.chart.items.length > 0) {
            const item = Object.values(state.coins.data)
              .find(el => el.name === state.chart.items[0].name);
            if (item) {
              return item.short;
            }
          }
          return '';
        },
        /**
         * Returns USD to current currency rate. Ex: USD->RUB = 62
         */
        rate: state => get(state.common.currencies, `${state.common.currency.toUpperCase()}.value`, 1),
      }),
      ...mapGetters({
        /**
         * Return fiat currency sign like $
         */
        currencySign: 'common/currencySign',
      }),
      socketChannelsList() {
        return this.exchangers.map(el => ({ exchanger: el.exchanger, pair: el.pair }));
      },
      priceSortedClasses() {
        if (this.priceSortedLength !== 0) {
          return this.exchangers
            .slice()
            .sort((a, b) => (a.price < b.price ? 1 : -1))
            .reduce((acc, el, i, arr) => {
              if (i <= this.priceSortedLength - 1) {
                acc[`${el.exchanger}_${el.pair}`] = 'ex-table__row--highest';
                return acc;
              } else if (i >= arr.length - this.priceSortedLength) {
                acc[`${el.exchanger}_${el.pair}`] = 'ex-table__row--lowest';
                return acc;
              }
              acc[`${el.exchanger}_${el.pair}`] = '';
              return acc;
            }, {});
        }
        return {};
      },
    },
    mounted() {
      /**
       * Add listeners to pause/release socket events to prevent page freeze on blur
       */
      window.addEventListener('focus', this.joinAll);
      window.addEventListener('blur', this.leaveAll);
    },
    beforeDestroy() {
      window.removeEventListener('focus', this.joinAll);
      window.removeEventListener('blur', this.leaveAll);
      this.wipeAllComponentData();
    },
    i18n: { // `i18n` option
      messages: {
        en: {
          exchangersTable: {
            exchange: 'Exchange',
            pair: 'Pair',
            lastTrade: 'Last Trade',
            lastTradePrice: 'Coin Price {currencySign}',
            lastTradeSum: 'Sum {currencySign}',
            lastTradeVolume: 'Volume {short}',
            totalDemand: 'Demand {currencySign}',
            totalOffer: 'Offer {short}',
            totalVolume: 'Volume {currencySign}',
            total: 'Total',
          },
        },
        ru: {
          exchangersTable: {
            exchange: 'Биржа',
            pair: 'Пара',
            lastTrade: 'Последняя сделка',
            lastTradePrice: 'Цена монеты {currencySign}',
            lastTradeSum: 'Сумма {currencySign}',
            lastTradeVolume: 'Объем {short}',
            totalDemand: 'Спрос {currencySign}',
            totalOffer: 'Предложение {short}',
            totalVolume: 'Объем {currencySign}',
            total: 'Общие',
          },
        },
      },
    },
  };
</script>

<style lang="sass" scoped>
  @import "./exchangesTable"
</style>

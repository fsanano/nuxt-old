<template lang="pug">
  div
    .container-fluid
      sortDropdown.dropdown__container.d-lg-none(
      :activeSortKey="sortBy",
      :activeSortAsc="ascending",
      :options="sortOptions",
      @value="sortTable({ key: $event.key, order: $event.order })"
      )
    .container-fluid.coins-table.py-3
      .row.no-gutters
        .col-12.pb-2.d-none.d-lg-block.border-bottom.border-secondary
          .row.no-gutters.coins-table__heading-row
            .col-11
              .row.no-gutters
                .col-lg-3.col-xl-2.c-table__th(
                :class="[getTableCoinsHeadingClass('name')]",
                @click="sortTable({ key: 'name' })"
                ) {{ $t('_coin') }}
                .col-lg-5.col-xl-4
                  .row.no-gutters
                    .col-3.c-table__th(
                    :class="[getTableCoinsHeadingClass('price')]",
                    @click="sortTable({ key: 'price' })"
                    ) {{ $t('price') }}
                    .col-5.c-table__th(
                    :class="[getTableCoinsHeadingClass('capitalization')]",
                    @click="sortTable({ key: 'capitalization' })"
                    ) {{ $t('capitalization') }}
                    .col-auto.c-table__th(
                    :class="[getTableCoinsHeadingClass('volume')]",
                    @click="sortTable({ key: 'volume' })"
                    ) {{ $t('volume') }}
                .col-lg-4.col-xl-3
                  .row.no-gutters.justify-content-around
                    .col-lg-3.col-xl-3.c-table__th(
                    :class="[getTableCoinsHeadingClass('change_day')]",
                    @click="sortTable({ key: 'change_day' })"
                    ) {{ $t('1d') }}
                    .col-lg-3.col-xl-3.c-table__th(
                    :class="[getTableCoinsHeadingClass('change_week')]",
                    @click="sortTable({ key: 'change_week' })"
                    ) {{ $t('7d') }}
                    .col-lg-3.col-xl-3.c-table__th(
                    :class="[getTableCoinsHeadingClass('change_month')]",
                    @click="sortTable({ key: 'change_month' })"
                    ) {{ $t('1month') }}
                .col-lg-3.col-xl-3.d-lg-none.d-xl-block
                  .row.no-gutters
                    .col-lg-4.col-xl-4.c-table__th(
                    :class="[getTableCoinsHeadingClass('price_day_min')]",
                    @click="sortTable({ key: 'price_day_min' })"
                    ) {{ $t('min') }}
                    .col-lg-4.col-xl-4.c-table__th(
                    :class="[getTableCoinsHeadingClass('price_day_avg')]",
                    @click="sortTable({ key: 'price_day_avg' })"
                    ) {{ $t('avg') }}
                    .col-lg-4.col-xl-4.c-table__th(
                    :class="[getTableCoinsHeadingClass('price_day_max')]",
                    @click="sortTable({ key: 'price_day_max' })"
                    ) {{ $t('max') }}
            .col-1
              .row.no-gutters
                .col-12
                  .row.text-center
                    .col-6.c-table__th(
                    :class="[getTableCoinsHeadingClass('exchanges')]",
                    @click="sortTable({ key: 'exchanges' })"
                    ) {{ $t('exchanges_short') }}
                    .col-6 {{ $t('_chart') }}
        template(v-for="coin in data")
          .col-12.py-3.border-bottom.border-secondary
            .row.align-items-center.no-gutters
              .col-12.col-lg-11
                .row.no-gutters.align-items-center
                  .col-12.col-sm-12.col-md-12.col-lg-3.col-xl-2
                    .d-flex.align-items-center
                      img.c-table__coin-icon.mr-2(:src="`/img/coins/${coin.name}.svg`")
                      nuxt-link(:to="`/${$route.params.lang}/coins/${coin.name}`")
                        h3.c-table__coin-name.m-0(v-html="coin.name")
                  .col-8.col-sm-8.col-md-6.col-lg-5.col-xl-4.pt-2.pt-sm-0
                    .row.no-gutters
                      .col-12.col-sm-12.col-md-12.col-lg-3.col-xl-3
                        span.d-inline.d-lg-none {{ $t('price') + ': ' }}
                        span {{ coin.price + currencySign | spacer }}
                      .col-12.col-sm-12.col-md-12.col-lg-5.col-xl-5
                        span.d-inline.d-lg-none {{ $t('capitalization_short') + ': ' }}
                        span {{ coin.capitalization + currencySign | spacer }}
                      .col-12.col-sm-12.col-md-12.col-lg-auto.col-xl-auto
                        span.d-inline.d-lg-none {{ $t('volume') + ': ' }}
                        span {{ coin.volume + currencySign | spacer }}
                  .col-4.col-sm-4.col-md-2.col-lg-4.col-xl-3.pt-2.pt-sm-0
                    .row.justify-content-around.no-gutters
                      .col-12.col-sm-12.col-md-12.col-lg-3.col-xl-3
                        .d-flex.align-items-center.justify-content-end.justify-content-lg-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('1d') }}
                          .chart-item__change.d-inline-block(:class="[{ 'chart-item__change--negative' : parseFloat(coin.change_day) < 0 }]")
                            span(v-html="coin.change_day")
                      .col-12.col-sm-12.col-md-12.col-lg-3.col-xl-3
                        .d-flex.align-items-center.justify-content-end.justify-content-lg-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('7d') }}
                          .chart-item__change.d-inline-block(:class="[{ 'chart-item__change--negative' : parseFloat(coin.change_week) < 0 }]")
                            span(v-html="coin.change_week")
                      .col-12.col-sm-12.col-md-12.col-lg-3.col-xl-3
                        .d-flex.align-items-center.justify-content-end.justify-content-lg-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('1month') }}
                          .chart-item__change.d-inline-block(:class="[{ 'chart-item__change--negative' : parseFloat(coin.change_month) < 0 }]")
                            span(v-html="coin.change_month")
                  .col-md-4.col-lg-3.col-xl-3.d-none.d-md-block.d-lg-none.d-xl-block
                    .row.no-gutters
                      .col-md-12.col-xl-4
                        .d-flex.justify-content-end.justify-content-xl-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('min') }}
                          span {{ coin.price_day_min + currencySign | spacer }}
                      .col-md-12.col-xl-4
                        .d-flex.justify-content-end.justify-content-xl-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('avg') }}
                          span {{ coin.price_day_avg + currencySign | spacer }}
                      .col-md-12.col-xl-4
                        .d-flex.justify-content-end.justify-content-xl-start
                          span.d-inline.d-lg-none.mr-2 {{ $t('max') }}
                          span {{ coin.price_day_max + currencySign | spacer }}
              .col-12.col-lg-1
                .row.pt-3.pt-lg-0
                  .col-6.col-sm-6.col-md-6.col-lg-6.col-xl-6
                    .d-flex.justify-content-start.justify-content-lg-center.align-items-center
                      span.d-inline.d-lg-none.mr-2 {{ $t('exchanges') }}
                      .setting__coin(
                      v-tooltip.bottom="{ content: $t('tooltip.exchanges')}",
                      @click.stop="$emit('exchanges', { coin: coin.name })"
                      )
                        .setting__data(v-html="coin.exchanges")
                        icon(name="bank").setting__coin
                  .col-6.col-sm-6.col-md-6.col-lg-6.col-xl-6
                    .d-flex.justify-content-end.justify-content-lg-center.align-items-center
                      span.d-inline.d-lg-none.mr-2 {{ $t('_chart') }}
                      input-checkbox(
                      v-tooltip.bottom="{ content: $t('tooltip.chart')}",
                      :id="coin.name",
                      :label="coin.name",
                      :value="chartCoins.findIndex(el => el === coin.name) > -1",
                      @input="$emit('checked', { value: $event, name: coin.name, entity: 'coin' })",
                      ).__withoutCheckbox
                        icon.setting__coin(
                        name="tochart",
                        slot="icon",
                        :class="{'disabled': chartCoins.findIndex(el => el === coin.name) === -1 }"
                        )
</template>

<script>
  import Vue from 'vue';
  import { mapState, mapGetters } from 'vuex';
  import get from 'lodash.get';

  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import sortDropdown from '~/components/ui/dropdown/sort.vue';
  import icon from '~/components/ui/icon.vue';

  import spacer from '~/helpers/mixins/spacer';

  export default {
    name: 'coins-table',
    mixins: [spacer],
    props: {
      coins: Array,
    },
    data() {
      return {
        // Enable background animations of numbers component on value change
        animate: true,

        // Sort ascending by default
        ascending: false,

        // Sort table by price by default
        sortBy: 'capitalization',

        // Source data for table
        data: [],

        // Used for sorting dropdown on mobiles
        sortOptions: [
          {
            key: 'name',
            title: this.$t('ui.sort.name'),
            buttons: [
              { text: 'Z &rarr; A', icon: null, ascending: true },
              { text: 'A &rarr; Z', icon: null, ascending: false },
            ],
          },
          {
            key: 'price',
            title: this.$t('ui.sort.price'),
            buttons: [
              { text: '$ &rarr; $$$', icon: 'arrow_top', ascending: true },
              { text: '$$$ &rarr; $', icon: 'arrow_down', ascending: false },
            ],
          },
          {
            key: 'capitalization',
            title: this.$t('ui.sort.capitalization'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: false },
              { text: '', icon: 'arrow_top', ascending: true },
            ],
          },
          {
            key: 'volume',
            title: this.$t('ui.sort.volume'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: false },
              { text: '', icon: 'arrow_top', ascending: true },
            ],
          },
          {
            key: 'change_day',
            title: this.$t('ui.sort.perday'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: false },
              { text: '', icon: 'arrow_top', ascending: true },
            ],
          },
          {
            key: 'change_week',
            title: this.$t('ui.sort.perweek'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: false },
              { text: '', icon: 'arrow_top', ascending: true },
            ],
          },
          {
            key: 'change_month',
            title: this.$t('ui.sort.permonth'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: false },
              { text: '', icon: 'arrow_top', ascending: true },
            ],
          },
          {
            key: 'exchanges',
            title: this.$t('ui.sort.exchanges'),
            buttons: [
              { text: '1 &rarr; 100', icon: null, ascending: true },
              { text: '100 &rarr; 1', icon: null, ascending: false },
            ],
          },
        ],

        tableCoinsData: [],

        tableColumns: [
          {
            key: 'name',
            name: 'Name',
          },
          {
            key: 'price',
            name: 'Price',
          },
          {
            key: 'capitalization',
            name: 'Cap',
          },
          {
            key: 'volume',
            name: 'Volume',
          },
          {
            key: 'change_day',
            name: 'Day',
          },
          {
            key: 'change_week',
            name: 'Week',
          },
          {
            key: 'change_month',
            name: 'Month',
          },
          {
            key: 'price_day_min',
            name: 'Low',
          },
          {
            key: 'price_day_avg',
            name: 'Average',
          },
          {
            key: 'price_day_max',
            name: 'Max',
          },
          {
            key: 'exchanges',
            name: 'Exchanges',
          },
          {
            key: 'is_on_chart',
            name: '',
          },
          {
            key: 'about',
            name: '',
          },
        ],
      };
    },
    components: {
      inputCheckbox,
      icon,
      sortDropdown,
    },
    watch: {
      coins: {
        handler(value) {
          /**
           * When we switching between coins this table won't remount
           * So we need explicitly leave all channels and clear some data
           */
          this.wipeAllComponentData();

          /**
           * Get table data from store based on coins list passed from props
           */
          this.getTableData(value);

          /**
           * Perform sorting by default
           */
          this.sortTable({ key: this.sortBy });
        },
        immediate: true,
      },
    },
    methods: {
      getTableCoinsHeadingClass(key) {
        if (this.sortBy === key) {
          if (this.ascending) {
            return 'c-table__th--asc';
          }
          return 'c-table__th--desc';
        }
        return '';
      },
      /**
       * Coins table methods end
       */
      wipeAllComponentData() {
        Vue.set(this, 'data', []);
      },
      /**
       *
       * @param {Array} coins - Coins full names
       */
      getTableData(coins) {
        this.data = coins
          .map((coin) => {
            const d = get(this.coinsData, coin, null);
            if (d) {
              return {
                name: d.name,
                price: d.price.value,
                capitalization: d.capitalization,
                volume: d.volume['24h'],
                change_day: d.change && d.change.day,
                change_week: d.change && d.change.week,
                change_month: d.change && d.change.month,
                price_day_min: d.day && d.day.min,
                price_day_avg: d.day && d.day.avg,
                price_day_max: d.day && d.day.max,
                exchanges: d.exchanges,
                is_on_chart: this.chartItems.findIndex(c => c.name === coin.name) > -1,
              };
            }
            return false;
          })
          .filter(Boolean);
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
        this.data = this.data
          .slice()
          .sort((a, b) => {
            let f = {};

            switch (key) {
              case 'name':
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
    },
    computed: {
      ...mapState({
        coinsData: state => state.coins.data,
        chartItems: state => state.chart.items,
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
        chartCoins: 'chart/chartCoins',
      }),
    },
  };
</script>

<style lang="sass" scoped>
  @import "./coinsTable"
</style>

<template lang="pug">
  .table-container
    .table-title(v-html="$t('exchange.title')")

    .table__scroll(v-bar v-if="showTable")
      .table__scrollable
        .table-wrap(v-match-heights="{el: ['.th']}")

          .table-content.__withoutScroll
            .table
              .tr
                .th(v-html="$t('exchange.market')" )

              .tr(v-for="exchange in exchangesList")
                .td
                  .exchange__name-container
                    a(:href="exchange.url" rel="nofollow" target="_blank" v-html="exchange.exchange").exchange__name

          .table-content
            .table
              .tr(:class="[lowToHight? 'high': 'low']")
                .th(
                  v-html="$t('exchange.trade_pair')",
                  :class="[{sorted: sorted === 'trade_pair'}]",
                  @click="sortBy('trade_pair')"
                )
                .th(
                  v-html="$t('exchange.lastTradeSum')",
                  :class="[{sorted: sorted === 'price'}]",
                  @click="sortBy('price')"
                )
                .th(
                  v-html="$t('exchange.lastTradeVol') + ' ' + currencySign",
                  :class="{sorted: sorted === 'volume'}",
                  @click="sortBy('volume')"
                )
                .th(
                  v-html="$t('exchange.volume')",
                  :class="{sorted: sorted === 'totalVolume'}",
                  @click="sortBy('totalVolume')"
                )
                .th(
                  v-html="$t('exchange.totalDemand')",
                  :class="{sorted: sorted === 'totalDemandUsd'}",
                  @click="sortBy('totalDemandUsd')"
                )
                .th(
                  v-html="$t('exchange.totalOffer') + currencySign",
                  :class="{sorted: sorted === 'totalOffer'}",
                  @click="sortBy('totalOffer')"
                )

              .tr(v-for="pair in exchangesList")
                .td(v-html="pair.name ? checkUsd(pair.name) : '-'")
                .td(v-html="pair.lastTradeData ? parseDigits(pair.lastTradeData.price) : '-'")
                .td(v-html="pair.lastTradeData ? parseDigits(pair.lastTradeData.volume) : '-'")
                .td(v-html="pair.totalVolume ? parseDigits(pair.totalVolume) : '-'")
                .td(v-html="pair.totalDemandUsd ? parseDigits(pair.totalDemandUsd) : '-'")
                .td
                  span(v-html="pair.totalOffer ? parseDigits(pair.totalOffer) : '-'")

    .table__bottom(v-html="$t('exchange.usdDesc')")

</template>

<script>
  import get from 'lodash.get';

  export default {
    name: 'tableDefault',
    mixins: [],
    props: {
      tabledata: {
        type: Object,
        required: true,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        sorted: false,
        showTable: true,
        lowToHight: false,
        exchangesList: [],
        currencySign: '',
      };
    },
    components: {},
    watch: {},
    methods: {
      parseDigits(value) {
        if (!value) return '';
        return value.toLocaleString().replace(',', '.');
      },

      checkUsd(value) {
        [this.currencySign] = value.split('/');
        return value.indexOf('USD') !== -1 ? value : `${value}*`;
      },

      sortBy(field) {
        this.sorted = field;

        this.lowToHight = !this.lowToHight;

        this.exchangesList.sort((a, b) => {
          if (field === 'price' || field === 'volume') {
            // eslint-disable-next-line
            return parseFloat(get(b.lastTradeData, field, 0)) - parseFloat(get(a.lastTradeData, field, 0));
          }
          // eslint-disable-next-line
          return parseFloat(get(b, field, 0)) - parseFloat(get(a, field, 0));
        });

        if (this.lowToHight) {
          this.exchangesList.reverse();
        }
      },

      convertToArray(obj) {
        this.exchangesList = [];
        const arr = Object.entries(obj);
        const sorted = [];
        arr.forEach((item) => {
          const exchangeName = item[0];
          const exchangePairs = item[1].trade_pairs;
          const exchangeUrl = item[1].url;
          exchangePairs.forEach((pair) => {
            pair.exchange = exchangeName;
            pair.url = exchangeUrl;
            sorted.push(pair);
          });
        });
        this.exchangesList = sorted;
        this.showTable = true;
      },
    },
    mounted() {
      this.convertToArray(this.tabledata);
    },
  };
</script>

<style lang="sass">
  @import "./table.sass";
</style>

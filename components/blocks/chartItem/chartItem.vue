<template lang="pug">
  .chart-item
    .row.align-items-center
      .col-12.mb-1
        .border-bottom.border-secondary.w-100
      .col-6.col-sm-4.col-md-12.col-lg-12
        .row
          .col-12
            .d-flex.justify-content-md-center.align-items-center
              template(v-if="content.name === 'ICEI10'")
                img.mr-2(:src="'/img/icei10.svg'", style="width: 24px; height: 24px")
              template(v-else-if="content.capitalization.value > 0")
                img.mr-2(:src="'/img/coins/'+content.name+'.svg'", style="width: 24px; height: 24px")
              template(v-else="content.capitalization.value === 0")
                img.mr-2(:src="'/img/48x48.png'", style="width: 24px; height: 24px; border-radius: 20px")
              span.chart-item__name(
              v-html="content.name.toUpperCase()"
              :style="{ borderBottomColor: content.color }"
              )
          .col-12.text-md-center
            .row.align-items-center.no-gutters.mt-2
              .col-12.col-xl-6.text-xl-right
                span.chart-item__value(
                :class="[ content.price.grow ? 'chart-item__value--grow' : '' ]"
                ) {{ currencySign + roundToFixed(content.close.value, 2) | spacer }}
              .col-12.col-xl-6.text-left
                span.chart-item__change.ml-0.ml-xl-2(
                :class="[ content.price.grow ? 'chart-item__change--grow' : '' ]"
                ) {{ roundToFixed(content.change, 2, true) + '%' }}
      .col-6.col-sm-8.col-md-12.col-lg-12.mt-0.mt-lg-2
        .row
          .col-12.col-sm-6.col-md-6.col-lg-6.chart-item__candle.text-right.text-md-left
            span high:
            br.d-none.d-xl-none
            span(
            :class="[ content.high.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.high.value, 2) | spacer }}
          .col-12.col-sm-6.col-md-6.col-lg-6.chart-item__candle.text-right.text-md-left
            span low:
            br.d-none.d-xl-none
            span(
            :class="[ content.low.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.low.value, 2) | spacer }}
          .col-12.col-sm-6.col-md-6.col-lg-6.chart-item__candle.text-right.text-md-left
            span open:
            br.d-none.d-xl-none
            span(
            :class="[ content.open.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.open.value, 2) | spacer }}
          .col-12.col-sm-6.col-md-6.col-lg-6.chart-item__candle.text-right.text-md-left
            span close:
            br.d-none.d-xl-none
            span(
            :class="[ content.close.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.close.value, 2) | spacer }}
      .col-12.col-sm-6.col-md-12.chart-item__candle(v-show="content.capitalization.value > 0")
        .row
          .col-6.col-md-12.col-lg-12.col-xl-6
            span {{ $t('capitalization') }}
          .col-6.col-md-12.col-lg-12.col-xl-6.text-right.text-md-left
            span(
            :class="[ content.capitalization.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.capitalization.value, 0) | spacer }}
      .col-12.col-sm-6.col-md-12.chart-item__candle(v-show="content.volume.value > 0")
        .row
          .col-6.col-md-12.col-lg-12.col-xl-6
            span {{ $t('volume') }}
          .col-6.col-md-12.col-lg-12.col-xl-6.text-right.text-md-left
            span(
            :class="[ content.volume.grow ? 'grow' : 'fall' ]",
            ) {{ currencySign + roundToFixed(content.volume.value, 0) | spacer }}

      .col-12(v-if="showContentChanges && staticContent.change")
        .row
          .col-6
            span.chart-item__candle.mr-1 {{ $t('chart.intervals.hour') }}
            span.chart-item__change(
            :class="[ staticContent.change.hour.charAt(0) !== '-' ? 'chart-item__change--grow' : '' ]"
            ) {{ roundToFixed(staticContent.change.hour, 2, true) + '%' }}
          .col-6
            span.chart-item__candle.mr-1 {{ $t('chart.intervals.day') }}
            span.chart-item__change(
            :class="[ staticContent.change.day.charAt(0) !== '-' ? 'chart-item__change--grow' : '' ]"
            ) {{ roundToFixed(staticContent.change.day, 2, true) + '%' }}
          .col-6
            span.chart-item__candle.mr-1 {{ $t('chart.intervals.week') }}
            span.chart-item__change(
            :class="[ staticContent.change.week.charAt(0) !== '-' ? 'chart-item__change--grow' : '' ]"
            ) {{ roundToFixed(staticContent.change.week, 2, true) + '%' }}
          .col-6
            span.chart-item__candle.mr-1 {{ $t('chart.intervals.month') }}
            span.chart-item__change(
            :class="[ staticContent.change.month.charAt(0) !== '-' ? 'chart-item__change--grow' : '' ]"
            ) {{ roundToFixed(staticContent.change.month, 2, true) + '%' }}

      .col-12.d-none.d-md-block.mt-3(v-if="showContentText && staticContent.text.length > 0")
        p.chart-item__candle.px-1 {{ staticContent.text }}
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import spacer from '~/helpers/mixins/spacer';

  export default {
    name: 'chart-item',
    mixins: [spacer],
    props: {
      content: {
        type: Object,
        default() {
          return {
            name: '',
            entity: 'coin',
            color: '#FF0000',
            change: 0,
            price: {
              value: 0,
              grow: true,
            },
            high: {
              value: 0,
              grow: true,
            },
            low: {
              value: 0,
              grow: true,
            },
            open: {
              value: 0,
              grow: true,
            },
            close: {
              value: 0,
              grow: true,
            },
            capitalization: {
              value: 0,
              grow: true,
            },
            volume: {
              value: 0,
              grow: true,
            },
          };
        },
      },
    },
    methods: {
      roundToFixed(number, digits, exclude) {
        if (number) {
          const f = parseFloat(number);
          if (f >= 10 || exclude) {
            return f.toFixed(digits);
          }

          return f.toFixed(4);
        }
        return number;
      },
    },
    computed: {
      ...mapState({
        coins: state => state.coins.data,
        indices: state => state.indices.data,
        showContentText: state => state.chart.items.length < 2,
        showContentChanges: state => state.chart.items.length < 3,
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
      staticContent() {
        const d = this.coins[this.content.name] || this.indices[this.content.name] || null;

        if (d) {
          return {
            change: {
              hour: d.change.hour,
              day: d.change.day,
              week: d.change.week,
              month: d.change.month,
            },
            // indices haven't any description
            text: d.description || '',
          };
        }

        return { text: '', change: null };
      },
    },
  };
</script>

<style lang="sass">
  @import "./chartItem"
</style>

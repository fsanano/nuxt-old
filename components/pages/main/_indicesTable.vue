<template lang="pug">
  div
    sortDropdown.d-lg-none.mb-2(
    :activeSortKey="sortBy",
    :activeSortAsc="ascending",
    :options="sortOptions",
    @value="sortTable({ key: $event.key, order: $event.order })"
    )
    table.w-100
      thead
        tr.d-none.d-lg-table-row
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'name' })",
          :class="[getHeadingClass('name'), 'no-select']",
          ) {{ $t('indicesTable.name') }}
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'price' })",
          :class="[getHeadingClass('price'), 'no-select']",
          ) {{ $t('indicesTable.price') }}
          th(
          rowspan="2",
          colspan="3",
          )
            table.w-100
              thead
                tr
                  th.text-center(
                  colspan="3",
                  ) {{ $t('indicesTable.changes') }}
                tr
                  th(
                  @click.stop="sortTable({ key: 'changeDay' })",
                  :class="[getHeadingClass('changeDay'), 'no-select']",
                  ) {{ $t('indicesTable.day') }}
                  th(
                  @click.stop="sortTable({ key: 'changeWeek' })",
                  :class="[getHeadingClass('changeWeek'), 'no-select']",
                  ) {{ $t('indicesTable.week') }}
                  th(
                  @click.stop="sortTable({ key: 'changeMonth' })",
                  :class="[getHeadingClass('changeMonth'), 'no-select']",
                  ) {{ $t('indicesTable.month') }}
          th.d-none.d-xl-table-cell(rowspan="2", colspan="3")
            table.w-100
              thead
                tr
                  th.text-center(colspan="3") {{ $t('indicesTable.dayTotal') }}
                tr
                  th(
                  @click.stop="sortTable({ key: 'dayLow' })",
                  :class="[getHeadingClass('dayLow'), 'no-select']",
                  ) {{ $t('indicesTable.low') }}
                  th(
                  @click.stop="sortTable({ key: 'dayAvg' })",
                  :class="[getHeadingClass('dayAvg'), 'no-select']",
                  ) {{ $t('indicesTable.avg') }}
                  th(
                  @click.stop="sortTable({ key: 'dayHigh' })",
                  :class="[getHeadingClass('dayHigh'), 'no-select']",
                  ) {{ $t('indicesTable.high') }}
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'originPrice' })",
          :class="[getHeadingClass('originPrice'), 'no-select']",
          ) {{ $t('indicesTable.originPrice') }}
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'fullChange' })",
          :class="[getHeadingClass('fullChange'), 'no-select']",
          ) {{ $t('indicesTable.fullChange') }}
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'coins' })",
          :class="[getHeadingClass('coins'), 'no-select']",
          ) {{ $t('indicesTable.coins') }}
          th(
          rowspan="2",
          @click.stop="sortTable({ key: 'onChart' })",
          :class="[getHeadingClass('onChart'), 'no-select']",
          ) {{ $t('indicesTable.isOnChart') }}
      tbody
        template(v-for="index in indices")
          //-----------------------
            Small mobiles table row
            -----------------------
          tr.d-sm-none
            td.py-2
              table
                tbody
                  tr
                    td(style="vertical-align: top;")
                      h4.index-data__name {{ index.name }}
                      span.index-data__value {{ index.price + currencySign }}
                      br
                      span {{ $t('indicesTable.originPrice') }}
                      br
                      span {{ index.originPrice + currencySign }}
                    td.text-right
                      span.d-inline-block {{ $t('indicesTable.1H') }}
                        span.index-data__change.ml-2(
                        :class="[{ 'index-data__change--grow' : parseFloat(index.changeHour) >= 0 }]"
                        ) {{ index.changeHour }}
                      br
                      span.d-inline-block.mt-1 {{ $t('indicesTable.1D') }}
                        span.index-data__change.ml-2(
                        :class="[{ 'index-data__change--grow' : parseFloat(index.changeDay) >= 0 }]"
                        ) {{ index.changeDay }}
                      br
                      span.d-inline-block.mt-1 {{ $t('indicesTable.1W') }}
                        span.index-data__change.ml-2(
                        :class="[{ 'index-data__change--grow' : parseFloat(index.changeWeek) >= 0 }]"
                        ) {{ index.changeWeek }}
                      br
                      span.d-inline-block.mt-1 {{ $t('indicesTable.1M') }}
                        span.index-data__change.ml-2(
                        :class="[{ 'index-data__change--grow' : parseFloat(index.changeMonth) >= 0 }]"
                        ) {{ index.changeMonth }}
                      br
                      span.d-inline-block.mt-1 {{ $t('indicesTable.fullChange') }}
                        span.index-data__change.ml-2(
                        :class="[{ 'index-data__change--grow' : parseFloat(index.fullChange) >= 0 }]"
                        ) {{ index.fullChange }}
                  tr
                    td
                      button.index-data__coins-button(
                      v-tooltip.bottom="{ content: $t('indicesTable.showCoins')}"
                      type="button",
                      @click="$emit('coins', index.name)",
                      )
                        icon.index-data__coin-icon(
                        :name="'bitcoin'",
                        :style="{ 'fill': theme === 'dark' ? 'white' : 'black' }",
                        )
                        span.ml-2 {{ $t('indicesTable.showCoins') }}
                        div.index_data__coins-counter.ml-2 {{ index.coins }}
                    td.text-right
                      .d-inline-flex.align-items-center
                        input-checkbox.d-inline-flex.__withoutCheckbox(
                        v-tooltip.bottom="{ content: $t('indicesTable.isOnChart')}",
                        :id="index.name",
                        :label="index.name",
                        @input="$emit('checked', { name: index.name, value: !isIndexOnChart(index.name), entity: 'index' })",
                        )
                          icon.setting__coin(
                          :class="[{ 'disabled': !isIndexOnChart(index.name) }]",
                          :value="isIndexOnChart(index.name)",
                          slot="icon",
                          name="tochart",
                          )
                        span.ml-2 {{ $t('indicesTable.isOnChart') }}
          tr.d-none.d-sm-table-row.d-lg-none
            td.py-2
              table
                tbody
                  tr
                    td(colspan="2")
                      span
                        span.index-data__name {{ index.name }} &nbsp;
                        span.index-data__value {{ index.price + currencySign }} &nbsp;
                        span ({{ $t('indicesTable.originPrice')}}: {{ index.originPrice + currencySign }})
                  tr
                    td.pt-2(colspan="2")
                      .d-flex.justify-content-between
                        span {{ $t('indicesTable.1H') }}
                          span.index-data__change.ml-2(
                          :class="[{ 'index-data__change--grow' : parseFloat(index.changeHour) >= 0 }]"
                          ) {{ index.changeHour }}
                        span {{ $t('indicesTable.1D') }}
                          span.index-data__change.ml-2(
                          :class="[{ 'index-data__change--grow' : parseFloat(index.changeDay) >= 0 }]"
                          ) {{ index.changeDay }}
                        span {{ $t('indicesTable.1W') }}
                          span.index-data__change.ml-2(
                          :class="[{ 'index-data__change--grow' : parseFloat(index.changeWeek) >= 0 }]"
                          ) {{ index.changeWeek }}
                        span {{ $t('indicesTable.1M') }}
                          span.index-data__change.ml-2(
                          :class="[{ 'index-data__change--grow' : parseFloat(index.changeMonth) >= 0 }]"
                          ) {{ index.changeMonth }}
                        span {{ $t('indicesTable.fullChange') }}
                          span.index-data__change.ml-2(
                          :class="[{ 'index-data__change--grow' : parseFloat(index.fullChange) >= 0 }]"
                          ) {{ index.fullChange }}
                  tr
                    td.text-center.py-2
                      button.index-data__coins-button(
                      v-tooltip.bottom="{ content: $t('indicesTable.showCoins')}"
                      type="button",
                      @click="$emit('coins', index.name)",
                      )
                        icon.index-data__coin-icon(
                        :name="'bitcoin'",
                        :style="{ 'fill': theme === 'dark' ? 'white' : 'black' }",
                        )
                        span.ml-2 {{ $t('indicesTable.showCoins') }}
                        div.index_data__coins-counter.ml-2 {{ index.coins }}
                    td.text-center.py-2
                      .d-inline-flex.align-items-center
                        input-checkbox.d-inline-flex.__withoutCheckbox(
                        v-tooltip.bottom="{ content: $t('indicesTable.isOnChart')}",
                        :id="index.name",
                        :label="index.name",
                        @input="$emit('checked', { name: index.name, value: !isIndexOnChart(index.name), entity: 'index' })",
                        )
                          icon.setting__coin(
                          :class="[{ 'disabled': !isIndexOnChart(index.name) }]",
                          :value="isIndexOnChart(index.name)",
                          slot="icon",
                          name="tochart",
                          )
                        span.ml-2 {{ $t('indicesTable.isOnChart') }}
          //-----------------
            Desktop table row
            -----------------
          tr.d-none.d-lg-table-row
            td.py-2
              h4.index-data__name {{ index.name }}
            td
              span.index-data__value {{ index.price + currencySign }}
            td
              span.index-data__change(
              :class="[{ 'index-data__change--grow' : parseFloat(index.changeDay) >= 0 }]"
              ) {{ index.changeDay }}
            td
              span.index-data__change(
              :class="[{ 'index-data__change--grow' : parseFloat(index.changeWeek) >= 0 }]"
              ) {{ index.changeWeek }}
            td
              span.index-data__change(
              :class="[{ 'index-data__change--grow' : parseFloat(index.changeMonth) >= 0 }]"
              ) {{ index.changeMonth }}
            td.d-none.d-xl-table-cell {{ index.dayLow + currencySign }}
            td.d-none.d-xl-table-cell {{ index.dayAvg + currencySign }}
            td.d-none.d-xl-table-cell {{ index.dayHigh + currencySign }}
            td {{ index.originPrice + currencySign }}
            td
              span.index-data__change(
              :class="[{ 'index-data__change--grow' : parseFloat(index.fullChange) >= 0 }]"
              ) {{ index.fullChange }}
            td
              button.index-data__coins-button(
              v-tooltip.bottom="{ content: $t('indicesTable.showCoins')}"
              type="button",
              @click="$emit('coins', index.name)",
              )
                icon.index-data__coin-icon(
                :name="'bitcoin'",
                :style="{ 'fill': theme === 'dark' ? 'white' : 'black' }",
                )
                span.d-none.ml-2 {{ $t('indicesTable.showCoins') }}
                div.index_data__coins-counter.ml-2 {{ index.coins }}
            td
              input-checkbox.d-inline-flex.__withoutCheckbox(
              v-tooltip.bottom="{ content: $t('indicesTable.isOnChart')}",
              :id="index.name",
              :label="index.name",
              @input="$emit('checked', { name: index.name, value: !isIndexOnChart(index.name), entity: 'index' })",
              )
                icon.setting__coin(
                :class="[{ 'disabled': !isIndexOnChart(index.name) }]",
                :value="isIndexOnChart(index.name)",
                slot="icon",
                name="tochart",
                )
              span.d-none.ml-2 {{ $t('indicesTable.isOnChart') }}



</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import icon from '~/components/ui/icon.vue';
  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import sortDropdown from '~/components/ui/dropdown/sort.vue';

  import i18n from './_indicesTable.i18n.json';

  export default {
    name: 'indices-table',
    props: {
      /**
       * Receives raw index data from API
       * (https://api.icex.ch/api/index?detail=1&readable=1)
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
        sortBy: 'price',

        ascending: false,

        // Source data for table
        indices: [],

        // Used for sorting dropdown on mobiles
        sortOptions: [
          {
            key: 'name',
            title: this.$t('indicesTable.name'),
            buttons: [
              { text: 'Z &rarr; A', icon: null, ascending: true },
              { text: 'A &rarr; Z', icon: null, ascending: false },
            ],
          },
          {
            key: 'price',
            title: this.$t('indicesTable.price'),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'changeHour',
            title: this.$t('indicesTable.hour', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'changeDay',
            title: this.$t('indicesTable.day', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'changeWeek',
            title: this.$t('indicesTable.week', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'changeMonth',
            title: this.$t('indicesTable.month', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'originPrice',
            title: this.$t('indicesTable.originPrice', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'fullChange',
            title: this.$t('indicesTable.fullChange', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'coins',
            title: this.$t('indicesTable.coins', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
          {
            key: 'onChart',
            title: this.$t('indicesTable.isOnChart', { currencySign: this.currencySign }),
            buttons: [
              { text: '', icon: 'arrow_down', ascending: true },
              { text: '', icon: 'arrow_top', ascending: false },
            ],
          },
        ],
      };
    },
    components: {
      sortDropdown,
      icon,
      inputCheckbox,
    },
    watch: {
      data: {
        handler(value) {
          /**
           * Convert raw data from prop into suitable array
           */
          this.convertDataToConsumableArray(value);

          /**
           * Perform sorting by default
           */
          this.sortTable({ key: this.sortBy });
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      isIndexOnChart(name) {
        return this.chartIndices.findIndex(el => el === name) > -1;
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

        this.sortBy = key;
        this.indices = this.indices
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
      getHeadingClass(key) {
        if (this.sortBy === key) {
          if (this.ascending) {
            return 'table__th table__th--asc';
          }
          return 'table__th table__th--desc';
        }
        return 'table__th';
      },
      convertDataToConsumableArray(value) {
        this.indices = Object.values(value).map(index => ({
          name: index.name,
          price: index.price.value,
          changeHour: index.change.hour,
          changeDay: index.change.day,
          changeWeek: index.change.week,
          changeMonth: index.change.month,
          dayLow: index.day.min,
          dayAvg: index.day.avg,
          dayHigh: index.day.max,
          originPrice: index.price.value_origin,
          fullChange: index.change.all,
          coins: index.coins.length,
        }));
      },
    },
    computed: {
      ...mapState({
        theme: state => state.common.theme,
        chartItems: state => state.chart.items,
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
        chartIndices: 'chart/chartIndices',
      }),
    },
    i18n,
  };
</script>

<style lang="sass" scoped>
  @import "~bootstrap/scss/functions"
  @import "~bootstrap/scss/variables"
  @import "~bootstrap/scss/mixins"
  @import "~assets/sass/vars.sass"

  $green: #02C39A
  $red: #E71D36

  table
    table-layout: fixed
    width: 100%
    font-size: .8rem
    border-collapse: collapse

  .index-data__name
    font-size: 1rem
    line-height: 1.5
    margin-bottom: 0
    font-weight: bold
    text-overflow: ellipsis
    overflow: hidden

  .index-data__value
    font-size: 1rem

  .index-data__coins-button
    position: relative

    display: inline-flex
    align-items: center

    background: transparent
    border: none
    cursor: pointer
    color: inherit
    padding: 0
    &:focus
      outline: none

  .index-data__change
    display: inline-block
    color: $red
    border: 1px solid $red
    border-radius: 5px
    padding: 3px 5px
    font-size: .8rem
    transition: all .2s ease

    @include media-breakpoint-up(xl)
      font-size: .6rem

    @include media-breakpoint-between(sm, lg)
      font-size: .6rem

  .index-data__change--grow
    color: $green
    border: 1px solid $green

  .index-data__coin-icon
    width: 24px
    height: 24px

  .index_data__coins-counter
    position: absolute
    left: 7px
    top: -3px
    width: 16px
    height: 16px
    line-height: 16px
    font-size: .5rem
    color: white
    text-align: center
    background: $denim
    border-radius: 100%

  // styles of exchanger and onChart icons
  .setting__coin
    position: relative
    cursor: pointer
    user-select: none
    fill: $denim
    &.disabled
      fill: $pale_sky

  .table__th
    cursor: pointer

    &:hover::after
      opacity: 1

    &::after
      content: ''
      display: inline-block
      width: 0
      height: 0
      border-style: solid
      border-width: 0 6.5px 8px 6.5px
      border-color: transparent transparent #919191 transparent
      margin-left: 5px
      opacity: 0
      transition: opacity .2s ease

    &.table__th--asc::after
      opacity: 1

    &.table__th--desc::after
      opacity: 1
      border-width: 8px 6.5px 0 6.5px
      border-color: #919191 transparent transparent transparent

</style>

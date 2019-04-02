<template lang="pug">
  .row
    .col-6.col-sm-4.col-md-6.col-lg-5.col-xl-6
      .row
        .col-12.col-md-6
          h4.index-data__name {{ data.name }}
        .col-12.col-md-6
          span.index-data__value {{ currencySign + data.price.value }}
    .col-6.col-sm-4.col-md-3.col-xl-4.text-right
      .row
        .col-12.col-md-12.col-lg-6
          .d-flex.align-items-center
            span.mr-2 {{ $t('indexData.1W') }}
            span.index-data__change(
            :class="[{ 'index-data__change--grow' : parseFloat(data.change.week) >= 0 }]"
            ) {{ data.change.week }}
        .col-12.col-md-12.col-lg-6.mt-2.mt-lg-0
          .d-flex.align-items-center
            span.mr-2 {{ $t('indexData.1M') }}
            span.index-data__change(
            :class="[{ 'index-data__change--grow' : parseFloat(data.change.month) >= 0 }]"
            ) {{ data.change.month }}
    .col-12.col-sm-4.col-md-3.col-lg-4.col-xl-2.mt-2.mt-sm-0
      .row.align-items-center
        .col-6.col-sm-12.col-lg-6.text-left.text-sm-right
          .d-inline-flex.align-items-center
            input-checkbox.d-inline-flex.__withoutCheckbox(
            v-tooltip.bottom="{ content: $t('indexData.isOnChart')}",
            :id="data.name",
            :label="data.name",
            :disabled="disabled",
            @input="$emit('checked', { name: data.name, value: !checked, entity: 'index' })",
            )
              icon.setting__coin(
              :class="[{ 'disabled': !checked }]",
              :value="checked",
              slot="icon",
              name="tochart",
              )
            span.d-xl-none.ml-2 {{ $t('indexData.isOnChart') }}
        .col-6.col-sm-12.col-lg-6.text-right.mt-0.mt-sm-2.mt-lg-0
          button.index-data__coins-button(
          v-tooltip.bottom="{ content: $t('indexData.showCoins')}"
          type="button",
          @click="$emit('coins', data.name)",
          )
            icon.index-data__coin-icon(
            :name="'bitcoin'",
            )
            span.d-xl-none.ml-2 {{ $t('indexData.showCoins') }}
</template>

<script>
  import { mapGetters } from 'vuex';
  import icon from '~/components/ui/icon.vue';
  import inputCheckbox from '~/components/ui/input/checkbox.vue';

  export default {
    name: 'index-data',
    props: {
      data: Object,
      checked: Boolean,
      disabled: Boolean,
    },
    components: {
      icon,
      inputCheckbox,
    },
    computed: {
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
    },
  };
</script>

<style lang="sass" scoped>
  @import "~bootstrap/scss/functions"
  @import "~bootstrap/scss/variables"
  @import "~bootstrap/scss/mixins"
  @import "~assets/sass/vars.sass"

  $green: #02C39A
  $red: #E71D36

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
    display: inline-flex
    align-items: center

    background: transparent
    border: none
    cursor: pointer
    padding: 0
    &:focus
      outline: none

  .index-data__change
    color: $red
    border: 1px solid $red
    border-radius: 5px
    padding: 3px 5px
    font-size: .8rem
    transition: all .2s ease

    @include media-breakpoint-up(xl)
      font-size: .6rem

  .index-data__change--grow
    color: $green
    border: 1px solid $green

  .index-data__coin-icon
    width: 24px
    height: 24px

  // styles of exchanger and onChart icons
  .setting__coin
    position: relative
    cursor: pointer
    user-select: none
    fill: $denim
    &.disabled
      fill: $pale_sky

</style>

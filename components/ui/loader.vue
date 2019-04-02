<template lang="pug">
  transition(name="fade")
    .loader__container(v-if="showLoader" :class="theme")

      .loader__logo
        svg(version='1.1', xmlns='http://www.w3.org/2000/svg', xmlns:xlink='http://www.w3.org/1999/xlink', x='0px', y='0px', width='181.531px', height='55.118px', viewbox='0 0 181.531 55.118', enable-background='new 0 0 181.531 55.118', xml:space='preserve' ref="loader-chart")
          g
            path(d='M0,0.001h14.292v55.117H0V0.001z')
            g
              polygon(points='142.942,55.117 151.075,43.5 154.273,38.503 154.417,38.729 162.448,27.257 144.136,0.248 127.265,0.248 145.376,27.085 126.479,55.117')
              polygon(points='166.165,21.946 181.531,0 164.429,0 158.075,10.013')
              polygon(points='165.738,32.108 157.597,43.736 164.822,55.117 181.337,55.117')
            g
              polygon(points='83.577,21.101 83.577,33.612 119.445,33.612 123.466,27.085 119.82,21.101')
              path(d='M116.784,13.154l-8.685-12.907H83.577v12.818C94.387,13.08,116.784,13.154,116.784,13.154z')
              path(d='M83.577,42.354v12.744l23.84,0.019l8.583-12.803C115.999,42.313,93.704,42.389,83.577,42.354z')
            g
              path(d='M55.077,42.313c-6.359-0.111-11.359-5.517-11.359-14.615c0-8.44,4.392-14.581,9.748-14.624 c1.904-0.018,7.02-0.012,12.827,0.002V0.248H48.504C37.326,0.376,28.294,12.652,28.294,27.699 c0,15.047,9.031,27.256,20.209,27.384v0.006l17.788,0.015V42.362C61.438,42.362,57.143,42.35,55.077,42.313z')
        .logo__text index

      .loader__chart
        svg(version='1.1', xmlns='http://www.w3.org/2000/svg', xmlns:xlink='http://www.w3.org/1999/xlink', x='0px', y='0px', viewbox='0 0 540 160', style='enable-background:new 0 0 540 160;', xml:space='preserve' width="540" height="160" :class="chartStatus")
          path(fill="none" stroke="#0b50cd" stroke-width="2" stroke-miterlimit="10" stroke-dasharray = "700" stroke-dashoffset = "700" d='M2.869,84.775 c4.667,2.667,10.667,4.751,17.333,0.751s20.667,2.062,24,5.396s11.333,2.683,16.667,2.016s10.667-7.997,15.333-8.663 s6.667,16.668,14,16.668s15.333-12,24-14s16-19,22-19s23.333,29.666,26,29.666s8.666,0,15.333,0s13.333,17.168,19.333,18.501 s17.333-2.25,35.333,1.083s22,40.542,44.667,40.542c22.666,0,34.666-58.729,63.999-58.729s50.001,6.636,62.667,2.636 s21.334-19.35,30-19.35s6.666-10.007,19.333-10.674s11.333-16.005,34-21.338s13.667-38.669,45.667-42.669')

      .loader__index(v-if="indexData")
        .loader__price(v-if="indexData.price") {{ currencySign + indexData.price.value | spacer}}
        .loader__change(:class="changeDay" v-if="indexData.change") {{ indexData.change.day }}
      .loader__date {{now}}

</template>

<script>
  import icon from '~/components/ui/icon.vue';
  import moment from 'moment';
  import { mapState, mapGetters } from 'vuex';
  import change from '~/helpers/mixins/change';
  import spacer from '~/helpers/mixins/spacer';

  export default {
    name: 'loader',
    mixins: [change, spacer],

    data: () => ({
      loading: true,
      chartStatus: '',
    }),

    components: {
      icon,
    },

    watch: {
      showLoader(newVal) {
        if (newVal) {
          this.chartStatus = 'start';
          this.preventScroll(false);
        } else {
          this.preventScroll(true);
        }
      },
    },

    methods: {
      finish() {
        this.chartStatus = 'finish';
        if (this.isMobile) {
          this.$store.dispatch('common/setUserMenuSize', 'min');
        }
        setTimeout(() => {
          this.loading = false;
          this.chartStatus = '';
          this.$store.dispatch('common/setLoaderStatus', false);
        }, 1000);
      },
      preventScroll(val) {
        setTimeout(() => {
          this.finish();
          this.$preventScroll.disable();
          // this.scrollEnable();
        }, 10000);
        if (val) {
          // this.scrollDisable();
          this.$preventScroll.disable();
        } else {
          this.$preventScroll.enable();
          // this.scrollEnable();
        }
      },

    },

    computed: {
      ...mapState({
        theme: state => state.common.theme,
        isMobile: state => state.common.isMobile,
        indexData: state => state.indices.data.ICEI10,
        currency: state => state.common.currency,
        showLoader: state => state.common.showLoader,
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
      now() {
        return moment().format('DD.MM.YY HH:mm:ss');
      },

      changeDay() {
        return this.change(this.indexData.change, 'day');
      },
    },

    async created() {
      this.chartStatus = 'start';
      this.$store.dispatch('indices/fetchIndexData', {
        name: 'ICEI10',
        params: {
          convert: this.currency,
        },
      });
      this.finish();
    },

    mounted() {
      this.preventScroll(false);
    },

    beforeDestroy() {
      this.preventScroll(true);
    },
  };
</script>

<style lang="sass" scoped>
  @import '~assets/sass/vars.sass';

  .fade-enter-active,
  .fade-leave-active
    transition: opacity .3s

  .fade-enter,
  .fade-leave-to
    opacity: 0

  .loader
    &__container
      position: fixed
      top: 0
      left: 0
      z-index: 1100
      width: 100vw
      height: 100vh
      display: flex
      flex-flow: column wrap
      justify-content: center
      align-items: center

    &__logo
      text-align: center
      .icon
        max-width: 4.5rem
        width: 100%
        height: 28px

    &__chart
      margin-top: -2rem
      max-width: 95%
      svg
        max-width: 100%
        path
        &.start
          path
            animation: start 2s ease-out 1
            animation-fill-mode: forwards

        &.finish
          path
            animation: finish 1s ease-in 1
            animation-fill-mode: forwards

    &__index
      display: flex
      align-items: flex-end
      margin-top: 1.5rem
      font-weight: bold

    &__price
      font-size: 2rem
      color: $denim

    &__change
      position: relative
      padding-bottom: .4rem
      padding-left: .8rem
      margin-left: .5rem
      margin-right: .5rem
      font-size: .9rem
      &:before
        content: ''
        position: absolute
        left: 0
        width: 0
        height: 0
        border-top: .5rem solid transparent
        border-bottom: .5rem solid transparent
        border-left: .3rem solid transparent
        border-right: .3rem solid transparent

      &.up
        color: $salem
        &:before
          border-bottom-color: $salem

      &.down
        color: $crimson
        &:before
          top: .4rem
          border-top-color: $crimson

    &__date
      font-size: .6rem
      margin-top: .3rem

  @keyframes start
    from
      stroke-dashoffset: 700
    to
      stroke-dashoffset: 300

  @keyframes finish
    from
      stroke-dashoffset: 300
    to
      stroke-dashoffset: 0


  .light

    &.loader
      &__container
        background-color: $catskill_white

    .loader
      &__logo
        color: $denim
        svg
          fill: $denim


  .dark

    &.loader
      &__container
        background-color: $cloud_burst

    .loader
      &__logo
        color: white
        svg
          fill: white


      &__date
        color: white

</style>

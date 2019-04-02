<template lang="pug">
  span.root(:class="cssClass") {{ roundToFixed(value, decimals) | spacer }}
</template>

<script>
  export default {
    name: 'numbers',
    props: {
      value: {
        type: [String, Number],
      },
      decimals: {
        type: Number,
        default: 2,
      },
      animate: {
        type: Boolean,
        default: false,
      },
    },
    watch: {
      value: {
        handler(newVal, oldVal) {
          if (!this.animate) {
            this.cssClass = '';
            return false;
          }

          if (oldVal && this.value >= oldVal) {
            this.cssClass = 'highlight-grow';
          } else {
            this.cssClass = 'highlight-fall';
          }

          return setTimeout(() => {
            this.cssClass = '';
            return false;
          }, 300);
        },
      },
    },
    data() {
      return {
        cssClass: '',
      };
    },
    methods: {
      roundToFixed(number, digits) {
        if (number) {
          const f = parseFloat(number);
          if (f >= 10) {
            return f.toFixed(digits);
          }

          return f.toFixed(4);
        }
        return number;
      },
    },
    filters: {
      spacer(num) {
        if (!num) {
          return '-';
        }

        const whole = num.toString().split('.');

        whole[0] = whole[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        return whole.join('.');
      },
    },
  };
</script>

<style lang="sass" scoped>
  .root
    white-space: nowrap
    will-change: background-color

  .highlight-grow
    animation: grow .4s linear 0s 1 normal forwards running

  .highlight-fall
    animation: fall .4s linear 0s 1 normal forwards running

  @keyframes grow
    90%
      background-color: #02C39A
    100%
      background-color: inherit

  @keyframes fall
    90%
      background-color: #E71D36
    100%
      background-color: inherit
</style>

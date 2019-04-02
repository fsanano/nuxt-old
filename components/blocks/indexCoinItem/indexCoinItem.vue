<template lang="pug">
  .user-index.user-index--wild(:class="[{ 'user-index--small' : !showFull }]")
    .d-flex.justify-content-between.align-items-center
      .user-index__name(
        :title="content.name"
      ) {{ showFull ? content.name : content.short | capitalize }}

      button.user-index__button-remove(
        v-if="!disabled"
        type="button",
        @click="emitRemoveButtonClick"
      )
        icon.cross-mark(:name="'cross-mark'")

    .d-flex.justify-content-between.align-items-center.pt-2
      .user-index__price(
        v-if="showFull",
        :title="currencySign + content.price"
      ) {{ currencySign + content.price | spacer }}

      .user-index__color(
        v-if="!showFull",
        :style="[{ background: content.color }]",
      )
      .user-index__change(
        v-if="showFull",
        :class="[{ 'user-index__change--negative' : isChangeNegative }]",
        :title="content.change"
      ) {{ content.change }}


    template(v-if="showInput")
      template(v-if="indexType === 'icextop10'")
        .d-flex.justify-content-between.align-items-center.pt-2.user-index__percent-container
          div.d-flex.justify-content-between.align-items-center

            span.aside-coin__icon.mr-1
              img(:src="`/img/coins/${content.name}.svg`")
            .user-index__price {{ content.percentCount }}

          div
            .user-index__price ${{ content.percentPrice }}

        .d-flex.justify-content-between.align-items-center.pt-3.user-index__percent-container
          formfeild(
            type="text"
            name="indexCoinPercent"
            ref="indexCoinPercent"
            :onlyNumbers="true"
            :errors="errors"
            v-model="indexCoinPercent"
          ).__short
          .user-index__percent %

      template(v-else)
        .d-flex.justify-content-between.align-items-center.pt-2.user-index__percent-container
          formfeild(
            type="text"
            name="indexCoinCount"
            :onlyNumbers="true"
            ref="indexCoinCount"
            :errors="errors"
            v-model="indexCoinCount"
          ).__short

          span.aside-coin__icon
            img(:src="`/img/coins/${content.name}.svg`")

        .d-flex.justify-content-between.align-items-center.pt-2.user-index__percent-container
          formfeild(
            type="text"
            name="indexCoinCost"
            :onlyNumbers="true"
            ref="indexCoinCost"
            :errors="errors"
            v-model="indexCoinCost"
          ).__short
          .user-index__percent {{currencySign}}



</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import icon from '~/components/ui/icon.vue';
  import spacer from '~/helpers/mixins/spacer';
  import formfeild from '~/components/ui/input/formfield.vue';

  export default {
    name: 'index-coin-item',
    mixins: [spacer],
    watch: {
      content(newVal) {
        this.errors.coinPercent = [];
        if (Number(newVal.percent) < 1) {
          this.notif('min');
        }

        if (Number(newVal.percent) === '') {
          this.notif('empty');
        }
      },

      indexCoinCost(newVal) {
        const res = this.checkNumber(newVal / this.content.price);
        this.indexCoinCountFixed = res;
        this.checkInputToErrors(newVal);

        this.$store.dispatch('indices/setUserIndexCoin', {
          name: this.content.name,
          cost: newVal,
        });
        return newVal;
      },
    },

    props: {
      content: {
        type: Object,
        default() {
          return {
            name: '',
            short: '',
            price: 0.00,
            currency: 'usd',
            change: 0,
            color: '#FF0000',
            percent: 10,
            cost: 10,
          };
        },
      },

      showFull: {
        type: Boolean,
        default: true,
      },

      disabled: {
        type: Boolean,
        default: false,
      },

      showInput: {
        type: Boolean,
        default: false,
      },

      indexType: {
        type: String,
        default: 'icextop10',
      },
    },

    data() {
      return {
        errors: {
          coinPercent: [],
          indexCoinCost: [],
          indexCoinCount: [],
          indexCoinPercent: [],
        },
        indexCoinCost: 10,
        indexCoinCountFixed: 0,
      };
    },

    components: {
      icon,
      formfeild,
    },

    filters: {
      capitalize(value) {
        if (!value) {
          return '';
        }
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },

    methods: {
      emitRemoveButtonClick() {
        return this.$emit('remove', this.content.name);
      },

      notif(err) {
        this.$store.dispatch('notifications/addNotification', {
          type: 'warn',
          text: this.$t(`notification.index.coin.error.${err}`, { name: this.content.name }),
        });
      },

      calculateCount() {
        this.indexCoinCountFixed = this.checkNumber(this.indexCoinCost / this.content.price);
      },

      checkNumber(num) {
        const str = num.toString();
        if (num % 1 !== 0) {
          const digitsAfterDots = str.includes('.')
            ? (str.split('.').pop())
            : 0;

          if (digitsAfterDots) {
            if (digitsAfterDots.length > 2 || digitsAfterDots.length === 2) {
              return Math.round(num * 100) / 100;
            }
          }
        }
        return num;
      },

      checkInputToErrors(newVal) {
        if (!newVal) {
          this.notif('empty');
          this.errors.indexCoinPercent.push('empty');
        }

        const num = newVal * 1;

        if (num < 0) {
          this.notif('negative');
          this.errors.indexCoinPercent.push('negative');
          return false;
        }
        return true;
      },
    },

    computed: {
      ...mapState({
        currency: state => state.common.glossary.currency,
        userIndexCoins: state => state.indices.userIndexCoins,
        userPercentEntered: (state) => {
          const coins = state.indices.userIndexCoins;
          const coinsKeys = Object.keys(coins);
          const percents = coinsKeys.map(key => coins[key].percent);
          const userPercentEntered = percents.reduce((sum, current) => (sum * 1) + (current * 1));
          return userPercentEntered;
        },
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
      indexCoinPercent: {
        get() {
          return this.content.percent;
        },
        set(newVal) {
          const num = newVal * 1;
          const oldVal = this.userIndexCoins[this.content.name].percent;
          const coinsCount = Object.keys(this.userIndexCoins).length - 1;
          const newSum = num + (this.userPercentEntered - oldVal) + coinsCount;

          if (newSum > 100) {
            this.notif('exceed');
            this.errors.indexCoinPercent.push('exceed');
            return false;
          }

          this.checkInputToErrors(newVal);

          this.$store.dispatch('indices/setUserIndexCoin', {
            name: this.content.name,
            percent: newVal,
          });

          return true;
        },
      },

      indexCoinCount: {
        get() {
          return this.indexCoinCountFixed;
        },
        set(newVal) {
          this.indexCoinCountFixed = newVal;

          const res = this.checkNumber(newVal * this.content.price);
          this.indexCoinCost = res;

          this.checkInputToErrors(newVal);

          this.$store.dispatch('indices/setUserIndexCoin', {
            name: this.content.name,
            count: newVal,
          });
          return newVal;
        },
      },


      isChangeNegative() {
        return parseFloat(this.content.change) < 0;
      },
    },

    mounted() {
      this.calculateCount();
    },
  };
</script>

<style lang="sass">
</style>

<template lang="pug">
  no-ssr
    modal(name="addIndex" width="82%" height="auto" @before-close="beforeClosingModal" @before-open="beforeOpeningModal")
      form(@submit.prevent="createIndex").modal__container
        .modal__title(v-html="$t('index.modal.title')")

        .modal__close(@click="closeModal")
          icon(name="delete")

        .modal__row
          formfeild(
          type="text"
          name="indexName"
          ref="indexname"
          :errors="errors"
          v-model="indexName"
          ).__short.mb-2

          .form__btn.mb-2(@click="resetCoins" v-html="$t('index.modal.resetBtn')")

        .modal__row
          .index__types(@click="toggleIndexType")
            .index__type(:class="{'index__type--active': indexType === 'icextop10'}") icextop10
            switcher(:active="indexType === 'free'", :theme="theme")
            .index__type(:class="{'index__type--active': indexType === 'free'}") free

          .index-sum.d-flex
            .index-sum__title(v-html="$t('index.price')")
            .index-sum__val(v-if="indexType === 'free'") {{ (Math.round(coinsSum * 100) / 100) + currencySign }}
            .index-sum__val(v-else) {{ 1000 + currencySign }}

          //- .change-coin__container()
          //-   .change-coin__label(v-html="$t('coin.add')" @click="openCoinsDropdown")
        .modal__cropp
          .modal__coins(v-bar)
            .modal__bar
              template(v-for="coin in coinsData")
                .modal__chartitem
                  index-coin-item(
                  :content="coin",
                  :showFull="showFullCoinInfo",
                  :showInput="showInput",
                  :indexType="indexType",
                  @remove="removeIndexCoin(coin.name)"
                  )

              .modal__chartitem(
              v-if="showAddIndexBtn"
              v-click-outside="closeCoinsDropdown"
              )
                .user-index.user-index--add(@click="openCoinsDropdown")

                  template(v-if="showLoader")
                    .highcharts-loading
                      .highcharts-loading-inner

                  template(v-else)
                    .index__name(v-html="$t('index.yourCoin')")
                    .d-flex.justify-content-center
                      icon(name="plus").index__plus

                .change-coin__modal(
                v-if="coinChangeModalIsOpen"
                :class="{'change-coin__modal--visible': coinChangeModalIsOpen}"
                )
                  autocomplete(
                  v-model="indexCoins"
                  :suggestions="coinsList"
                  :showSuggestionsByDefault="showSuggestions"
                  type="bottom"
                  @value="addIndexCoin($event)"
                  )

        button.form__btn(
        v-html="$t('form.submit')",
        :class="{'form__btn--disabled': disableSubmitButton }"
        )

        template(v-if="!isMobile")
          .modal__desc(v-if="indexType === 'icextop10'" v-html="$t('index.modal.desc1')")
          .modal__desc(v-else v-html="$t('index.modal.desc2')")

</template>

<script>
  import icon from '~/components/ui/icon.vue';
  import isEmpty from 'lodash.isempty';

  import formfeild from '~/components/ui/input/formfield.vue';
  import indexCoinItem from '~/components/blocks/indexCoinItem';
  import { mapState, mapGetters } from 'vuex';

  import autocomplete from '~/components/ui/input/autocomplete.vue';

  import switcher from '~/components/ui/switcher.vue';

  export default {
    name: 'add-index',

    data() {
      return {
        showLoader: false,
        indexName: '',
        indexCoins: '',
        showFullCoinInfo: true,
        showSuggestions: true,
        showInput: true,
        coinChangeModalIsOpen: false,
        indexSend: false,
        indexType: 'free',
        errors: {
          indexName: [],
        },
      };
    },

    components: {
      icon,
      formfeild,
      indexCoinItem,
      autocomplete,
      switcher,
    },

    methods: {
      /**
       * Short method to call notification
       * @param  {String} type [Accept one of the options: error, info, warn ]
       * @param  {String} msg  [Accept notif body message]
       * @return {[type]}      [Show notification]
       */
      notif(type, msg) {
        this.$store.dispatch('notifications/addNotification', {
          type,
          text: msg,
        });
      },
      /**
       * Choose index type, toggle between free and icextop10
       */
      toggleIndexType() {
        if (this.indexType === 'free') {
          this.indexType = 'icextop10';
        } else {
          this.indexType = 'free';
        }
      },
      /**
       * Close adding index modal
       */
      closeModal() {
        this.$modal.hide('addIndex');
      },
      /**
       * Focus on modal input for adding index name
       */
      focusInput() {
        setTimeout(() => {
          this.$refs.indexname.$refs.input.focus();
        }, 300);
      },
      /**
       * Validate index add for and create index
       */
      async createIndex() {
        let coins = [];
        if (this.indexType === 'icextop10') {
          if (!this.indexName.length) {
            this.notif('warn', this.$t('notification.index.error.emptyName'));
            return false;
          }
          if (this.userIndexCoinsLength < 2) {
            this.notif('warn', this.$t('notification.index.error.coinsCount'));
            return false;
          }

          this.userIndexCoins.forEach((el) => {
            if (el.percent === '') {
              this.notif('warn', this.$t('notification.index.error.coinValue', { name: el.name }));
              return false;
            }
            return true;
          });

          const sum = this.coinsData
            .map(coin => coin.percent)
            .reduce((total, current) => (total * 1) + (current * 1), 0);

          if (Math.round(sum) !== 100) {
            this.notif('warn', this.$t('notification.index.coin.error.sum', { sum }));
            return false;
          }

          coins = this.coinsData
            .map(coin => ({ coin: coin.name, percent: coin.percent }));
        } else {
          coins = this.coinsData
            .map(coin => ({ coin: coin.name, purchase_amount: coin.cost }));
        }

        this.$loader.show();

        this.indexSend = true;

        const payload = {
          name: this.indexName,
          type: this.indexType,
          token: this.$cookie.get('jwt'),
          convert: this.currency,
          coins,
        };

        const response = await this.$store.dispatch('indices/createUserIndex', payload);

        if (response.data.result) {
          this.$modal.hide('addIndex');
          this.$preventScroll.disable();
          this.indexName = '';

          this.$router.push({
            name: 'lang-indices-indexName',
            params: {
              lang: this.locale,
              indexName: response.data.name,
            },
          });

          this.notif('info', this.$t('notification.index.created', { index: response.data.name }));

          await this.$store.dispatch('indices/resetUserIndexCoins');
        } else {
          this.$loader.hide();
        }

        this.indexSend = false;
        return true;
      },
      /**
       * Add to the index coin
       * @param {String} coin [Coin name]
       */
      async addIndexCoin(coin) {
        this.showLoader = true;
        const name = coin.coin;
        await this.$store.dispatch('indices/setUserIndexCoin', { name, percent: 0, cost: 10 });

        if (isEmpty(this.coinsData[name])) {
          await this.$store.dispatch('coins/fetchCoinData', {
            name,
            params: {
              detail: true,
              convert: this.currency,
            },
          });
          this.showLoader = false;
        }

        this.closeCoinsDropdown();
      },
      /**
       * Remove the coin from the index by name
       * @param  {String} val [Coin name]
       * @return Remove coin
       */
      removeIndexCoin(val) {
        this.$store.dispatch('indices/deleteUserIndexCoin', val);
      },
      /**
       * Open coins dropdown
       * @return {[type]} [description]
       */
      openCoinsDropdown() {
        this.coinChangeModalIsOpen = true;
      },
      /**
       * Close coins dropdown
       * @return {[type]} [description]
       */
      closeCoinsDropdown() {
        this.coinChangeModalIsOpen = false;
      },

      /**
       * Method call before modal opening
       */
      beforeOpeningModal() {
        this.focusInput();
        this.$preventScroll.enable();
      },

      /**
       * Method call before closing modal
       */
      beforeClosingModal() {
        this.$preventScroll.disable();
      },
      /**
       * Delete all coins from index
       */
      resetCoins() {
        this.$store.dispatch('indices/resetUserIndexCoins');
      },
    },

    computed: {
      ...mapState({
        coinsList: state => state.coins.list.all
          .filter(el => Object.keys(state.indices.userIndexCoins).indexOf(el) === -1),

        addedCoins: state => Object.keys(state.coins.data)
          .filter(el => Object.keys(state.indices.userIndexCoins).indexOf(el) !== -1)
          .map((el, i) => {
            const data = state.coins.data[el];
            const coins = state.indices.userIndexCoins;

            const { cost } = coins[el];
            const { index } = coins[el];
            const { percent } = coins[el];
            const coinsKeys = Object.keys(coins);
            const coinsCount = coinsKeys.length;

            const percents = coinsKeys.map(key => coins[key].percent);

            const userPercentEntered = percents
              .reduce((sum, current) => (sum * 1) + (current * 1), 0);

            const coinsWithPercent = percents.filter(per => per !== 0).length;

            const userIndexPercent = percents
              .map((indexPercent) => {
                const per = indexPercent === 0
                  ? Number(((100 - (userPercentEntered * 1)) / (coinsCount - coinsWithPercent)))
                    .toFixed(2)
                  : indexPercent;
                return per;
              })
              .reduce((sum, current) => (sum * 1) + (current * 1), 0);

            const userPercentTotalResidue = Number((100 - userIndexPercent).toFixed(2));
            let currentCoinPercent = percent === 0
              ? Number(((100 - (userPercentEntered * 1)) / (coinsCount - coinsWithPercent)))
                .toFixed(2)
              : percent;

            if (userPercentTotalResidue) {
              if (i === (coinsCount - 1)) {
                currentCoinPercent =
                  (Number(currentCoinPercent) + Number(userPercentTotalResidue)).toFixed(2);
              }
            }

            const percentCount = Math.round((currentCoinPercent * 1000) / data.price.value) / 100;
            const percentPrice = Math.round(currentCoinPercent * 1000) / 100;

            return {
              name: data.name,
              short: data.short || data.name,
              price: data.price.value,
              currency: data.price.currency,
              change: data.change.day,
              color: state.common.glossary.colors[i],
              percent: currentCoinPercent,
              cost,
              index,
              percentCount,
              percentPrice,
            };
          })
          .sort((a, b) => a.index - b.index),
        userIndexCoinsLength: state => Object.keys(state.indices.userIndexCoins).length,
        userIndexCoins: state => Object.keys(state.indices.userIndexCoins)
          .map(key => ({
            name: key,
            percent: state.indices.userIndexCoins[key].percent,
          })),
        locale: state => state.common.locale,
        currency: state => state.common.currency,
        theme: state => state.common.theme,
        isMobile: state => state.common.isMobile,
        coinsSum: state => Object.values(state.indices.userIndexCoins)
          .map(el => el.cost)
          .reduce((total, current) => total + (current * 1), 0),
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
      coinsData() {
        const counts = this.indexType === 'icextop10' ? 10 : 30;
        return this.addedCoins.slice(0, counts);
      },

      /**
       * Submit button must be disabled when:
       * we are sending new index right now
       * index name is less than 3 characters (back-end validate it)
       * user has chosen less then two coins (index is seamless in this case)
       * @return {boolean}
       */
      disableSubmitButton() {
        return this.indexSend ||
          this.indexName.length <= 3 ||
          this.userIndexCoins.length < 2;
      },

      showAddIndexBtn() {
        if (this.indexType === 'icextop10' && this.coinsData.length < 10) {
          return true;
        }
        if (this.indexType === 'free' && this.coinsData.length < 30) {
          return true;
        }
        return false;
      },
    },
  };
</script>

<style lang="scss">
  @import "~assets/sass/vars.sass";
  @import "../indexData/indexData.sass";
  @import "../indexGrid/indexGrid.sass";

  @import "~assets/sass/blocks/form.sass";
  @import "~assets/sass/blocks/modal.sass";
  @import "../../blocks/coinData/coinData.sass";
  @import "../indexCoinItem/indexCoinItem.sass";
</style>

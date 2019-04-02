<template lang="pug">
  no-ssr
    .coin__container(v-if="Object.keys(coin).length !== 0" :class="{'coin__container--active': newCoinsDropdownIsOpen}")
      .coin__info(v-if="coin")
        .coin__icon
          img(:src="`/img/coins/${coin.name}.svg`")

        .coin__name(v-html="coin.name + ' ICEX'")

        .coin__row
          .coin__price {{ currencySign + coin.price.value | spacer }}

          .change__data
            .coin__change(v-html="coin.change.day", :class="changeDay")
            .change__title.change__title--bottom(v-html="$t('period.day')")

          .change.__small
            .d-flex.flex-column.align-items-center
              .change__value(v-html="coin.change.month", :class="changeMonth")
              .change__title.change__title--bottom(v-html="$t('period.month')")

        .change__list
          .change__container
            .change
              .change__title(v-html="$t('period.week')")
              .change__value(v-html="coin.change.week", :class="changeWeek")

          .change__container
            .change
              .change__title(v-html="$t('period.month')")
              .change__value(v-html="coin.change.month", :class="changeMonth")

      .coin__extra
        .coin__data-list
          .data__row(v-for="prop in coinProps")
            span.data__key(v-html="$t(`coin.${prop}`)", :class="prop")

            template(v-if="prop === 'capitalization'")
              span.data__value(v-if="coin[prop] !== null") {{ currencySign + coin[prop] | spacer }}
              span.data__value(v-else v-html="$t('coin.nodata')")

            template(v-else-if="prop === 'day_volume'")
              span.data__value(v-if="coin.volume !== null") {{ currencySign + coin.volume['24h'] | spacer }}
              span.data__value(v-else v-html="$t('coin.nodata')")

            template(v-else)
              template(v-if="coin.day !== null")
                span.data__value(v-if="coin.day[prop] !== null") {{ currencySign + coin.day[prop] | spacer}}
                span.data__value(v-else v-html="$t('coin.nodata')")


        .coin__settings.d-flex.justify-content-between.align-items-center()
          input-checkbox(
            v-tooltip.bottom="{ content: $t('tooltip.chart')}"
            :id="coin.name",
            :label="coin.name"
            @input="emitChecked($event)",
          ).__withoutCheckbox
            icon(name="tochart" slot="icon" :class="{'disabled': !checked}").setting__coin

          //- .setting__coin(
          //-   v-tooltip.bottom="{ content: $t('tooltip.favorite')}"
          //-   @click="toggleFavorite()"
          //- )
          //-   icon(name="star_fill" v-if="favorite").setting__coin
          //-   icon(name="star_border" v-else).setting__coin

          .setting__coin(
            v-tooltip.bottom="{ content: $t('tooltip.exchanges')}"
            @click="openExchanges(coin.name)"
          )
            .setting__data(v-html="coin.exchanges")
            icon(name="bank").setting__coin

          //- icon(name="option").setting__coin

          //- icon(name="plus").setting__coin

          .change-coin__container(v-if="isUserIndex && auth" v-click-outside="closeNewCoinsDropdown")
            .change-coin__label(v-html="$t('coin.change')" @click="toggleNewCoinsDropdown")
            .change-coin__modal(:class="[{'change-coin__modal--visible': newCoinsDropdownIsOpen}, position]" ref="replaceModal")
              autocomplete(
                v-model="coinToChange"
                :suggestions="coins"
                :showSuggestionsByDefault="true"
                :type="autocompleteType"
                @value="replaceCoin(coin.name, $event)"
              )

      .coin__desc
        span(v-if="dataView === 'row'") {{ coin.description | truncate(100) }}
        span(v-html="coin.description" v-else)

      no-ssr
        modal(:name="'exchangeList' + coin.name" width="90%" height="auto" @before-close="beforeClose()")
          .modal__close(@click="closeModal" v-if="exchanges[coin.name]")
            icon(name="delete")
          tableExchange(:tabledata="exchanges[coin.name]" v-if="exchanges[coin.name]")

</template>

<script>
  import { mapState, mapGetters } from 'vuex';

  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import autocomplete from '~/components/ui/input/autocomplete.vue';
  import icon from '~/components/ui/icon.vue';

  import change from '~/helpers/mixins/change';
  import spacer from '~/helpers/mixins/spacer';

  import isEmpty from 'lodash.isempty';

  import tableExchange from '~/components/blocks/table/table.vue';

  export default {
    name: 'coin-data',

    mixins: [change, spacer],

    props: {
      coin: {
        type: Object,
        required: true,
        default() {
          return {};
        },
      },
      checked: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {
        position: [],
        coinProps: ['min', 'avg', 'max', 'capitalization', 'day_volume'],
        favorite: false,
        newCoinsDropdownIsOpen: false,
        coinToChange: '',
        autocompleteType: 'top',
      };
    },

    components: {
      inputCheckbox,
      autocomplete,
      icon,
      tableExchange,
    },

    methods: {
      /**
       * Check if the coin has exchange list in store state.coins.exchanges
       * @param  {String} coin [Coin name]
       * @return {[type]}      [description]
       */
      checkCoinExchange(coin) {
        if (this.exchanges[coin] === undefined) {
          this.fetchCoinExchange(this.coin.name, { detail: true });
        }
      },
      // Check if the coin has a stock exchanges
      /**
       * Fetch coin exchage list
       * @param  {String} name   [coin name]
       * @param  {Object} params [details, locales, currency, etc...]
       * @return {Array}         [request return Array of exchange objects and
       * set to state.coins.exchanges ]
       */
      async fetchCoinExchange(name, params) {
        return this.$store.dispatch('coins/fetchCoinExchange', {
          name,
          params,
        });
      },
      /**
       * Hide loader and enable scroll before modal close
       */
      beforeClose() {
        this.$preventScroll.disable();
        this.$loader.hide();
      },

      /**
       * Close modal and enable scroll
       */
      closeModal() {
        this.$preventScroll.disable();
        this.$modal.hide(`exchangeList${this.coin.name}`);
      },
      /**
       * Open modal and disable scroll
       */
      openModal() {
        this.$preventScroll.enable();
        this.$modal.show(`exchangeList${this.coin.name}`);
      },

      /**
       * Change coin status
       */
      toggleFavorite() {
        this.favorite = !this.favorite;
      },

      /**
       * Check if coin has excanges and then open modal
       * @param  {String} coin [Coin name]
       * @return Get coin exchanges and open modal
       */
      openExchanges(coin) {
        this.checkCoinExchange(coin);
        this.openModal();
      },

      emitChecked() {
        if (this.disabled) {
          return this.$store.dispatch('notifications/addNotification', {
            type: 'warn',
            text: 'You cannot remove main coin. Use aside bar instead.',
          });
        }
        return this.$emit('checked', !this.checked);
      },
      /**
       * Replace index coin
       * @param  {String} oldCoin [Coin for relacement]
       * @param  {String} newCoin [Replacement coin]
       * @return Call store action to replace index coins
       */
      async replaceCoin(oldCoin, newCoin) {
        this.$loader.show();
        /**
         * All params for replacing index coin, see https://docs.icex.ch/#replace-coins-in-user-index
         * @type {Object}
         */
        const payload = {
          /**
           * If the index page then takes the index name from the router,
           * otherwise the name of the selected (chosen) index
           * @type {String}
           */
          index: this.$route.params.index || this.indexChosen,
          params: {
            /**
             * Old and new coins
             * @type {Array}
             */
            coins: [{
              new: newCoin.coin,
              old: oldCoin,
            }],
            /**
             * User token
             * @type {String}
             */
            token: this.$cookie.get('jwt'),
          },
        };
        /**
         * Store action of change index coin
         */
        const response = await this.$store.dispatch('indices/changeUserIndexCoin', payload);

        if (response.data.result) {
          // hide new coins dropdown menu
          this.newCoinsDropdownIsOpen = false;
          // show success notification
          this.$store.dispatch('notifications/addNotification', {
            type: 'info',
            text: this.$t('notification.coin.replaced', { old: oldCoin, new: newCoin.coin }),
          });

          if (!this.$localStorage.getItem('notif-publish').data) {
            this.$store.dispatch('notifications/addNotification', {
              type: 'info',
              text: this.$t('notification.coin.public'),
            });
            this.$localStorage.setItem('notif-publish', true);
          }
        }
        // hide loader
        this.$loader.hide();
      },
      /**
       * Toggle dropdown of new coins
       */
      toggleNewCoinsDropdown() {
        this.newCoinsDropdownIsOpen = !this.newCoinsDropdownIsOpen;
        this.setDropdownPosition();
      },
      /**
       * Set dropdown position depending on the position on the screen
       */
      setDropdownPosition() {
        const data = this.$refs.replaceModal.getBoundingClientRect();
        const pos = [];
        const width = window.innerWidth
          || document.documentElement.clientWidth
          || document.body.clientWidth;

        this.autocompleteType = 'top';

        if (data.right > width) {
          pos.push('right');
        }

        if (data.top < 0) {
          this.autocompleteType = 'bottom';
          pos.push('top');
        }

        this.position = pos;
      },
      /**
       * Close new coins dropdown menu
       * @return       hide dropdown values
       */
      closeNewCoinsDropdown() {
        this.newCoinsDropdownIsOpen = false;
      },
    },

    computed: {
      ...mapState({
        exchanges: state => state.coins.exchange,
        coins: state => state.coins.list.all.filter((coin) => {
          const indexCoins = state.indices.data[state.indices.chosen].coins.map(c => c.name);
          return indexCoins.indexOf(coin) === -1;
        }),
        indexChosen: state => state.indices.chosen,
        theme: state => state.common.theme,
        auth: state => state.auth.auth,
        currency: state => state.common.currency,
        dataView: state => state.common.data.view,
        isUserIndex: (state) => {
          if (!isEmpty(state.indices.data) && !isEmpty(state.indices.data) && state.auth.auth) {
            if (!isEmpty(state.indices.chosen)) {
              const { author } = state.indices.data[state.indices.chosen];
              if (typeof author === 'string') {
                return false;
              }
              return author.id === state.auth.data.user_id;
            }
          }
          return false;
        },
      }),

      ...mapGetters({
        mainCoin: 'coins/mainCoin',
        additionalCoins: 'coins/additionalCoins',
        currencySign: 'common/currencySign',
      }),

      changeDay() {
        return this.change(this.coin.change, 'day');
      },

      changeWeek() {
        return this.change(this.coin.change, 'week');
      },

      changeMonth() {
        return this.change(this.coin.change, 'month');
      },
    },

    filters: {
      truncate(text, stop, clamp) {
        if (!text) {
          return '';
        }
        return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '');
      },
    },
  };
</script>

<style lang="sass">
  @import "./coinData";
</style>

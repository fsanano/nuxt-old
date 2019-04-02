<template lang="pug">

  li.index__item(
    @click="setChosenIndex(index.name)"
    v-if="index.name"
  )
    .index__name(v-html="index.name")
    div.index__info
      .index__price {{ currencySign + index.price.value | spacer}}
      .index__change(v-html="index.change.day", :class="changeDay")

      template(v-if="index.change.week && index.change.month")
        .change__list
          .change__container
            .change
              .change__title(v-html="$t('period.week')")
              .change__value(
                v-html="index.change.week",
                :class="changeWeek"
              )

          .change__container
            .change
              .change__title(v-html="$t('period.month')")
              .change__value(

                v-html="index.change.month",
                :class="changeMonth"
              )

      .index__settings.d-flex.justify-content-between
        input-checkbox(
          v-if="!disabled && showChartBtn"
          :value="checked",
          :id="index.name",
          :label="index.name",
          @input="emitCheck($event)",
          v-tooltip.bottom="{ content: $t('tooltip.chart')}"
        ).__withoutCheckbox
          icon(name="tochart", slot="icon", :class="{'disabled': !checked}").setting__coin
        span(v-else)
        //- .setting__coin(
        //-   v-if="index.author.id === userId && auth"
        //-   v-tooltip.bottom="{ content: $t('tooltip.publish')}",
        //-   @click="publishIndex()"
        //- )
        //-   icon(name="done" :class="indexStatus").setting__coin

        .setting__coin(
          v-if="index.author.id === userId && auth"
          v-tooltip.bottom="{ content: $t('tooltip.delete')}",
          @click="checkIntention(index.name)"
        )
          icon(name="delete").setting__coin

        //- .setting__coin(
        //-   v-tooltip.bottom="{ content: $t('tooltip.favorite')}",
        //-   @click="toggleFavorite()"
        //- )
        //-   icon(name="star_fill" v-if="favorite").setting__coin
        //-   icon(name="star_border" v-else).setting__coin


        //- icon(name="setting").setting__coin


    template(v-if="index.coins.length === 0")
      .index__desc(v-html="$t('index.noIndex')")


</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import change from '~/helpers/mixins/change';
  import spacer from '~/helpers/mixins/spacer';

  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import icon from '~/components/ui/icon.vue';

  import isEmpty from 'lodash.isempty';

  export default {
    name: 'index-item',

    mixins: [change, spacer],

    props: {
      index: {
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
        showChartBtn: true,
        chosen: '',
        favorite: '',
        indexStatus: '',
        coins: [],
      };
    },

    components: {
      inputCheckbox,
      icon,
    },

    methods: {
      /**
       * Emit event to parent component
       * @param  {String} value [Emit value]
       */
      emitCheck(value) {
        return this.$emit('checked', value);
      },
      /**
       * Set choosen index by name
       * @param {String} index [Index name]
       */
      setChosenIndex(index) {
        setTimeout(() => {
          this.$emit('chosen', index);
        }, 10);
      },
      /**
       * Toggle favorite indices
       * @return {[type]} [description]
       */
      toggleFavorite() {
        this.favorite = !this.favorite;
      },
      /**
       * Publish index to common indices
       */
      async publishIndex() {
        this.$loader.show();

        if (!isEmpty(this.index.status)) {
          this.indexStatus = this.index.status.name;
        }

        const payload = {
          name: this.index.name,
          params: {
            token: this.$cookie.get('jwt'),
            status: this.indexStatus === 'pending' ? 'active' : 'pending',
          },
        };

        await this.$store.dispatch('indices/updateUserIndex', payload);
        this.$loader.hide();

        this.$store.dispatch('notifications/addNotification', {
          type: 'info',
          text: this.$t(`notification.index.${this.indexStatus}`),
        });
      },
      /**
       * Show alert modal to check user intention before deleting index
       */
      async checkIntention(name) {
        this.$preventScroll.enable();
        await this.$store.dispatch('indices/setIndexToDelete', name);
        this.$modal.show('delete-index');
      },
    },

    computed: {
      ...mapState({
        currency: state => state.common.currency,
        userId: state => state.auth.data.user_id,
        auth: state => state.auth.auth,
      }),
      ...mapGetters({
        currencySign: 'common/currencySign',
      }),
      changeDay() {
        return this.change(this.index.change, 'day');
      },

      changeWeek() {
        return this.change(this.index.change, 'week');
      },

      changeMonth() {
        return this.change(this.index.change, 'month');
      },
    },

    mounted() {
      if (!isEmpty(this.index.status)) {
        this.indexStatus = this.index.status.name;
      }
      if (this.$route.name === 'lang-auth-personal') {
        this.showChartBtn = false;
      }
    },
  };
</script>

<style lang="sass">
  @import "./indexData.sass";
</style>

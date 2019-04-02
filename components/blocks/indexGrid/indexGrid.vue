<template lang="pug">
  div(v-if="content")
    ul(slot="content").index__list.d-flex.align-items-stretch.flex-wrap
      slot(
        v-for="item in content",
        :item="item",
        name="index-grid-item",
      )

      li.index__item.index__item--add(@click="showModalAddIndex()" v-if="auth")
        .index__name(v-html="$t('index.yourIndex')")
        .d-flex.justify-content-center
          icon(name="plus").index__plus
        .index__desc(v-html="$t('index.add')")

</template>

<script>
  import icon from '~/components/ui/icon.vue';

  import { mapState } from 'vuex';

  export default {
    name: 'indices-grid',

    data() {
      return {
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

    props: {
      content: {
        type: Array,
        default() {
          return [];
        },
      },
    },

    components: {
      icon,
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
       * Open modal for adding index
       */
      showModalAddIndex() {
        if (this.userStatus !== 'pending') {
          this.$modal.show('addIndex');
          if (this.isMobile) {
            if (this.indexType === 'free') {
              this.notif('info', this.$t('index.modal.desc2'));
            } else {
              this.notif('info', this.$t('index.modal.desc1'));
            }
          }
        } else {
          this.notif('warn', this.$t('notification.auth.verify'));
        }
      },
    },

    computed: {
      ...mapState({
        auth: state => state.auth.auth,
        userStatus: state => state.auth.data.status,
        isMobile: state => state.common.isMobile,
      }),
    },
  };
</script>

<style lang="scss">

</style>

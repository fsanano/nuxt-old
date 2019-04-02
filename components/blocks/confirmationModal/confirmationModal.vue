<template lang="pug">

    no-ssr
      modal(
        width="30%"
        height="auto"
        @before-close="beforeClosingModal"
        :name="'delete-index'"
      )

        .modal__container
          .modal__title(v-html="$t('index.modal.shure')")

          .modal__close(@click="closeModal")
            icon(name="delete")

          button.form__btn(v-html="$t('form.delete')" @click="deleteIndex")


</template>

<script>
  import { mapState } from 'vuex';
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'confirmation-modal',

    data() {
      return {
        favorite: '',
        coins: [],
      };
    },

    components: {
      icon,
    },

    methods: {
      /**
       * Close index delete modal
       */
      closeModal() {
        this.$preventScroll.disable();
        this.$modal.hide('delete-index');
      },
      /**
       * Method call before index delete modal
       */
      beforeClosingModal() {
        this.$preventScroll.disable();
      },
      /**
       * Delete user index
       */
      async deleteIndex() {
        this.$loader.show();
        this.$modal.hide('delete-index');
        this.$preventScroll.disable();

        await this.$store.dispatch('indices/deleteUserIndex', {
          name: this.indexToDelete,
          params: {
            token: this.$cookie.get('jwt'),
          },
        });
        await this.$store.dispatch('indices/setIndexToDelete', '');
        this.$loader.hide();
      },
    },

    computed: {
      ...mapState({
        indexToDelete: state => state.indices.indexToDelete,
      }),
    },
  };
</script>

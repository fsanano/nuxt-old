<template lang="pug">
  .page__container
    .container-fluid.personal__container
      .row
        .col-12.col-md-4
          .personal__data(v-if="userData")
            .personal__title(v-html="$t('user.cabinet')")

            .personal__row(v-for="data in data_to_show")
              .personal__label(v-html="$t(`user.${data}`)")
              .personal__val {{userData[`user_${data}`]}}

            // .personal__link(v-html="$t('form.changePass')")

        .col-12.col-md-8
          index-grid(:content="indexContent" slot="content")
            index-data(
              v-if="props.item",
              :index="props.item",
              slot="index-grid-item",
              slot-scope="props",
            )


</template>

<script>
  import { mapState } from 'vuex';
  import indexData from '~/components/blocks/indexData';
  import indexGrid from '~/components/blocks/indexGrid';

  import coinData from '~/components/blocks/coinData';
  import dataGrid from '~/components/blocks/dataGrid';

  export default {
    layout: 'base',
    name: 'signin',

    head() {
      return {
        title: this.$t('meta.pages.personal.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.personal.title'),
          },
        ],
      };
    },

    data() {
      return {
        data_to_show: ['name', 'email'],
      };
    },

    components: {
      indexData,
      indexGrid,
      coinData,
      dataGrid,
    },

    computed: {
      ...mapState({
        indexContent: state => state.indices.userList.map(index => state.indices.data[index]),
        userData: state => state.auth.data,
        userId: state => state.auth.data.user_id,
        userIndices: state => state.indices.userList,
        currency: state => state.common.currency,
      }),
    },

    async fetch({ store, redirect, params }) {
      if (!store.getters['auth/isUserLoggedIn']) {
        redirect(`/${params.lang}/auth/signin`);
      }

      const userIndices = await store.dispatch('indices/fetchAllUserIndices', {
        id: store.state.auth.data.user_id,
      });

      const promises = userIndices.data.data.map(el => store.dispatch('indices/fetchIndexData', {
        name: el.name,
        convert: store.state.common.currency,
      }));

      await Promise.all(promises);
    },
  };
</script>

<style lang="sass">
  @import '~assets/sass/vars.sass';
  @import 'components/blocks/indexData/indexData.sass';
  @import "~bootstrap/scss/bootstrap.scss";

  .personal

    &__container
      padding: 1rem

    &__title
      margin-bottom: .5rem
      font-size: 1.4rem
      color: $denim

    &__data
      border-right: 1px solid $pale_sky
      @include media-breakpoint-down(md)
        border: 0

    &__row
      margin-bottom: 1rem

    &__label
      font-size: .7rem
      color: $pale_sky

    &__val
      font-size: .8rem
      color: $tangaroa

    &__link
      font-size: .7rem
      color: $denim
      text-decoration: underline

</style>

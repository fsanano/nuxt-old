<template lang="pug">
  .toggle__btn.d-flex.align-items-center(:class="position" @click="toggleContent()")
    template(v-if="showContent")
      .switch__text(v-html="$t('ui.hide')" v-if="withText")
      .switch__icon
        icon(name="hide")
    template(v-else)
      .switch__text(v-html="$t('ui.show')" v-if="withText")
      .switch__icon
        icon(name="show")

</template>

<script>
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'toggle',

    props: {
      withText: {
        type: Boolean,
        required: true,
      },

      position: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        showContent: true,
      };
    },
    components: {
      icon,
    },

    methods: {
      toggleContent() {
        this.showContent = !this.showContent;
        this.$emit('toggle', this.showContent);
      },
    },
  };
</script>

<style lang="sass">

  @import '~assets/sass/vars.sass';

  .switch
    &__text
      width: 4rem
      text-align: right
      padding-right: .3rem
      font-size: .6rem
    &__icon
      svg
        width: .8rem


  .toggle
    &__btn
      z-index: 3
      &.absolute
        position: absolute
        top: .5rem
        right: .5rem

      &.static
        position: static

    &__text
      width: 3rem
      text-align: right
      padding-right: .3rem
      font-size: .6rem

    &__icon
      svg
        width: .8rem

    &__btn
      cursor: pointer

  .light

    .toggle

      &__text
        color: $pale_sky

      &__icon
        svg
          fill: $pale_sky

  .dark
    .toggle

      &__text
        color: $pale_sky

      &__icon
        svg
          fill: $pale_sky

</style>

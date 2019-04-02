<template lang="pug">
  .toggle__container(:class="{'closed': !showContent}", @dblclick="toggleContent(true)")

    toggle-btn(
      :withText="withText",
      position="absolute",
      @toggle="toggleContent($event)"
    )
    .toggle__label(v-html="label" v-show="!showContent")

    div(:class="{ 'hideToggleContent': !showContent}")
      slot(name="content" )

</template>

<script>
  import toggleBtn from '~/components/blocks/toggle/toggleBtn.vue';

  export default {
    name: 'toggle',

    props: {
      withText: {
        type: Boolean,
        required: true,
      },

      label: {
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
      toggleBtn,
    },

    methods: {
      toggleContent(val) {
        this.showContent = val;
      },
    },
  };
</script>

<style lang="sass">

  @import '~assets/sass/vars.sass';

  .hideToggleContent
    overflow: hidden
    height: 0
    visibility: hidden

  .toggle
    &__container
      padding: .8rem
      padding-right: 1.5rem
      padding-bottom: 0
      position: relative
      &.closed
        padding-top: .4rem
        padding-bottom: .4rem

    &__label
      width: 100%
      text-align: center
      font-size: 1rem
      font-weight: 600
      cursor: pointer

  .light
    .toggle
      &__container
        border-top: 1px solid $athens_gray
        border-bottom: 1px solid $athens_gray
      &__label
        color: $tangaroa

  .dark
    .toggle
      &__container
        border-top: 1px solid $big_stone
        border-bottom: 1px solid $big_stone
      &__label
        color: $cadet_blue

</style>

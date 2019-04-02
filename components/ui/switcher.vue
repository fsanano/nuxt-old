<template lang="pug">
  .switcher(:class="[theme, { 'switcher--active' : active }]")
    .switcher__ball
</template>

<script>
  export default {
    name: 'switcher',
    props: {
      theme: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
    },
  };
</script>

<style lang="sass">

  @import '~assets/sass/vars.sass';

  .switcher
    position: relative
    width: 1.7rem
    min-width: 1.7rem
    height: .9rem
    border-radius: .5rem
    cursor: pointer
    &--active
      .switcher__ball
        left: 0.95rem

    &.light
      box-shadow: 0 0 0 1px $pale_sky

      .switcher__ball
        background-color: $pale_sky

    &.dark
      box-shadow: 0 0 0 1px $denim

      .switcher__ball
        background-color: $denim

    &__ball
      position: absolute
      top: 0
      bottom: 0
      padding: 0
      border: 0
      left: .05rem
      margin: auto
      width: .7rem
      height: .7rem
      border-radius: .7rem
      transition: .3s
  @media (max-width: $w768)
    .switcher
      &__ball
        width: .65rem
        height: .65rem
</style>

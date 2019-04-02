<template lang="pug">
  .checkbox__container.d-flex

    input.checkbox__input(
    type='checkbox',
    ref="input",
    :id="id",
    :checked="value",
    :disabled="disabled",
    )

    label.checkbox__label(:for='id', @click.stop.prevent="emitChecked(!value)")
      span(v-if="this.$slots.icon === undefined" v-text='label')
      slot(name="icon")

</template>

<script>
  export default {
    name: 'input-checkbox',
    mixins: [],

    props: {
      id: {
        type: String,
        required: true,
      },

      value: {
        type: Boolean,
        required: false,
      },

      label: {
        type: String,
        required: false,
      },

      disabled: {
        type: Boolean,
      },
    },

    components: {},
    watch: {},
    methods: {
      emitChecked(value) {
        if (!this.disabled) {
          this.$emit('input', value);
        }
      },
    },
    computed: {},
    fetch() {},
    beforeCreate() {},
    created() {},
    beforeMount() {},
    mounted() {},
    beforeUpdate() {},
    updated() {},
    activated() {},
    deactivated() {},
    beforeDestroy() {},
    destroyed() {},
    errorCaptured() {},
  };
</script>

<style lang="sass">
  @import '~assets/sass/vars.sass';

  .checkbox
    &__container
      &:hover
        cursor: pointer
      &.__withoutCheckbox
        .checkbox__label
          padding: 0
          &:after,
          &:before
            display: none

    &__input
      display: none
      &:checked
        & + .checkbox__label
          &:before
            background-color: $denim
          &:after
            // top: 0.2rem
            opacity: 1

    &__label
      position: relative
      padding-left: 1.4rem
      margin-bottom: 0
      font-size: .7rem
      user-select: none
      &:hover
        cursor: pointer
        &:after
          will-change: transform

      &:after,
      &:before
        content: ''
        position: absolute
        top: 0
        bottom: 0
        margin: auto
        left: 0

      &:before
        width: .8rem
        height: .8rem
        border: 1px solid transparent
        border-radius: .2rem

      &:after
        left: 0.125rem
        opacity: 0
        // margin-top: 0.35rem
        width: .55rem
        height: .3rem
        transform: translateY(-.07rem) rotate(-45deg)
        transition: .2s
        border-left: 2px solid transparent
        border-bottom: 2px solid transparent

  .light
    .checkbox
      &__input
        &:checked
          & + .checkbox__label
            color: $denim
            &:after
              border-color: white
            &:before
              border-color: $denim
      &__label
        color: $pale_sky
        &:before
          border-color: $cadet_blue


  .dark
    .checkbox
      &__input
        &:checked
          & + .checkbox__label
            color: $denim
            &:after
              border-color: $cloud_burst
            &:before
              border-color: $denim
      &__label
        color: $pale_sky
        &:before
          border-color: $pale_sky

</style>

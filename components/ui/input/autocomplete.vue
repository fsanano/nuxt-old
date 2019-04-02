<template lang="pug">
  div.autocomplete__container(
    v-click-outside="closeSuggestions",
    :class="[{'open':openSuggestion}, type]"
  )

    input.autocomplete__input(
      type="text",
      autocapitalize="none",
      autocorrect="off",
      :placeholder="$t('ui.search')",
      :value="value",
      :class="type"
      @input="updateValue($event.target.value)",
      @keyup.prevent.enter = 'enter',
      @keyup.prevent.down = 'down',
      @keyup.prevent.up = 'up',
    )

    icon(:name="'search'" v-if="type === 'search'").autocomplete__icon

    .autocomplete__list-container(v-if="openSuggestion || showSuggestionsByDefault", :class="[{'show': open || showSuggestionsByDefault}, type]")
      .autocomplete__list-bar(v-bar :class="type")
        ul.autocomplete__list(:class="type")
          li(v-for="(suggestion, index) in matches")
            .autocomplete__list-item(
              v-html="highlighted[index]",
              :class="{'active': isActive(index)}",
              @click.shift="chooseSuggestion(suggestion, 'add')",
              @click.exact="chooseSuggestion(suggestion, 'push')",
            )

</template>

<script>
  import { mapState } from 'vuex';
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'autocomplete',

    props: {
      value: {
        type: String,
        required: true,
      },

      type: {
        type: String,
        required: false,
      },

      showSuggestionsByDefault: {
        type: Boolean,
        required: true,
      },

      suggestions: {
        type: Array,
        required: true,
      },
    },

    data() {
      return {
        open: false,
        current: -1,
      };
    },

    components: {
      icon,
    },

    methods: {
      updateValue(value) {
        if (!this.open) {
          this.open = true;
        }
        this.current = -1;
        this.$emit('input', value);
      },

      enter() {
        const coin = this.matches[this.current];
        this.chooseSuggestion(coin, 'push');
      },

      up() {
        if (this.current > 0) {
          this.current -= 1;
        }
      },

      down() {
        if (this.current < this.matches.length - 1) {
          this.current += 1;
        }
      },

      isActive(index) {
        return index === this.current;
      },

      chooseSuggestion(coin, type) {
        this.$emit('value', { coin, type });
        this.open = false;
      },

      closeSuggestions() {
        this.open = false;
      },
    },

    computed: {
      ...mapState({
        gridCoins: state => state.coins.grid,
        currency: state => state.common.currency,
      }),
      matches() {
        return this.suggestions.filter(obj => obj.indexOf(this.value) >= 0
          && this.gridCoins.indexOf(obj) === -1);
      },

      highlighted() {
        return this.matches.map(obj => obj.replace(this.value, `<span>${this.value}</span>`));
      },

      openSuggestion() {
        if (this.value !== undefined) {
          return this.value.length && this.open && this.matches.length;
        }
        return false;
      },
    },
  };
</script>

<style lang="sass">
  @import "~assets/sass/vars";
  @import '~assets/sass/mixins.sass';

  .autocomplete,
  .dropdown
    &__container
      position: relative
      z-index: 2
      width: 10rem
      // margin-left: 1.1rem
      border-radius: .2rem
      font-size: .8rem
      border-width: 1px
      border-style: solid
      @include breakpoint-down($w768)
        width: 45%
      @include breakpoint-down($w480)
        width: 100%

    &__input
      width: 100%
      height: 100%
      border: 0
      font-size: .8rem
      background-color: transparent
      &:focus
        outline: none

    &__list
      max-height: 100%
      &-container
        position: absolute
        width: calc(100% + 2px)
        border-width: 1px
        border-style: solid
        left: -1px

      &-item
        display: block
        padding: .2rem .5rem
        color: $tangaroa
        text-decoration: none
        cursor: pointer
        span
          color: $denim
        &:hover
          color: $denim
          text-decoration: none
        &.active
          color: $denim
  .dropdown
    &__container
      border-bottom-color: transparent
      border-bottom-left-radius: 0
      border-bottom-right-radius: 0

    &__input
      border-bottom: 1px solid transparent

    &__list
      border-top: 0 !important
      border-bottom-left-radius: .2rem
      border-bottom-right-radius: .2rem
      top: calc(100% - 2px)

  .autocomplete
    &__container
      @include breakpoint-down($w768)
        margin-right: .5rem
      &.bottom,
      &.search
        &.open
          border-bottom-color: transparent
          border-bottom-left-radius: 0
          border-bottom-right-radius: 0
      &.top
        padding-bottom: 1.5rem
        &.open
          border-top: 0
          // border-top-left-radius: 0
          // border-top-right-radius: 0

    &__input
      &.search,
      &.bottom
        border-bottom: 1px solid transparent
      &.top
        border-top: 1px solid transparent
        padding: .2rem .5rem
        padding-right: 2rem
        position: absolute
        bottom: 0
        left: 0
        z-index: 3
        height: 1.5rem

    &__list
      &-container
        &.search,
        &.bottom
          border-top: 0 !important
          border-bottom-left-radius: .2rem
          border-bottom-right-radius: .2rem
          top: calc(100% - 2px)

        &.top
          position: relative
          // padding-bottom: 1.5rem
          border-bottom: 0 !important
          border-top-left-radius: .2rem
          border-top-right-radius: .2rem
          bottom: calc(100% - 2px)

    &__icon
      position: absolute
      right: 7px
      top: 0
      bottom: 0
      margin: auto
      fill: $denim

    &__container
      &.search,
      &.bottom
        padding: .2rem .5rem
        padding-right: 2rem


    &__list
      height: 100%

    &__list,
    &__list-bar
      margin: 0
      &.search
      &.bottom
        .autocomplete__list,
        .autocomplete__list-bar
          max-height: 9rem
      &.top
        .autocomplete__list,
        .autocomplete__list-bar
          max-height: 6rem



  .light
    .autocomplete,
    .dropdown
      &__container,
      &__list-container
        border-color: $mischka
        background-color: white
        color: $tangaroa
        &.open
          .autocomplete__input
            border-color: $mischka

      &__input.top
        border-color: $mischka

      &__list
        &-item
          color: $tangaroa
          span
            color: $denim
          &:hover,
          &.active
            color: $denim

  .dark
    .autocomplete,
    .dropdown
      &__container,
      &__list-container
        border-color: $rhino
        background-color: $cloud_burst
        color: $cadet_blue
        &.open
          .autocomplete__input
            color: $cadet_blue
            border-color: $rhino

      &__input
        color: $cadet_blue
        border-color: $rhino

      &__list
        &-item
          color: $cadet_blue
          span
            color: $denim
          &:hover,
          &.active
            color: $denim

</style>

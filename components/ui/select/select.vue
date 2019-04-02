<template lang="pug">
  .select(v-click-outside="close")
    .select__body(@click="toggleOpen")
      .select__box(v-html="selectedText")
      transition(name="slide-bottom-fade")
        .select__inner(v-if="open")
          template(v-for="item in options")
            .select__item(
              v-html="item.text",
              :class="[{ 'select__item--active' : item.value === selected },{ 'select__item--disabled' : item.disabled }]"
              :title="item.title"
              @click="chooseItem(item.value, item.disabled)"
              )

</template>

<script>
  export default {
    name: 'v-select',
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      options: {
        type: Array,
        required: true,
        default() {
          return [];
        },
      },
      selected: {
        type: [String, Number, Boolean],
        required: true,
      },
    },
    methods: {
      close() {
        return this.$emit('open', false);
      },
      toggleOpen() {
        return this.$emit('open', !this.open);
      },
      chooseItem(item, disabled) {
        if (disabled) {
          return false;
        }

        this.$emit('selected', item);

        return this.$emit('open', false);
      },
    },
    computed: {
      selectedText() {
        const item = this.options.find(el => el.value === this.selected) || null;
        return item ? item.text : '';
      },
    },
  };
</script>

<style lang="sass">
  @import "./select"
</style>

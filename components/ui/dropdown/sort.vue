<template lang="pug">
  dropdown(:title="title", ref="dropdown").__sorting
    template(slot="list")
      .dropdown__item(v-for="item in options")
        .dropdown__item-title(v-html="item.title")
        .dropdown__item-content.d-flex.justify-content-around
          .dropdown__btn(
            v-for="(button, index) in item.buttons"
            :class="{ 'active': activeSortKey === item.key && activeSortAsc === button.ascending }",
            @click="emitValue({ key: item.key, order: button.ascending })"
          )
            span(v-if="button.text.length > 0", v-html="button.text")
            icon(v-else, :name="button.icon")
</template>

<script>
  import dropdown from '~/components/ui/dropdown';
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'sort-input',

    props: {
      activeSortKey: {
        type: String,
      },
      activeSortAsc: {
        type: Boolean,
      },
      options: {
        type: Array,
        default() {
          return [];
        },
      },
    },

    components: {
      dropdown,
      icon,
    },

    methods: {
      emitValue({ key, order }) {
        this.$emit('value', { key, order });
        this.$refs.dropdown.close();
      },
    },

    computed: {
      title() {
        const item = this.options.find(el => el.key === this.activeSortKey);
        const arrow = this.activeSortAsc ? '&uarr;' : '&darr;';
        return item ? `${item.title} ${arrow}` : '';
      },
    },
  };
</script>

<style lang="sass">

</style>

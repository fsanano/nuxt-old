<template lang="pug">
  .dropdown__container(:class="{'open': opened}" v-click-outside="close")
    .dropdown__title(@click="toggle")
      span(v-html="title")
      .dropdown__caret

    .dropdown__list-container(v-if="opened")
      .d-flex.justify-content-end
        slot(name="control")
      .dropdown__list
        slot(name="list")

</template>

<script>
  export default {
    name: 'select-box',

    mixins: [],

    props: {
      title: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        opened: false,
      };
    },

    components: {},

    watch: {},

    methods: {
      toggle() {
        this.opened = !this.opened;
      },

      close() {
        this.opened = false;
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
  @import "./dropdown.sass"
</style>

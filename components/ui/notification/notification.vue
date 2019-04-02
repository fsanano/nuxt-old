<template lang="pug">
  .notif(:class="[ getClass() ]")
    .notif__body
      .notif__title-row
        span.notif__title(v-html="title[type]")
        button.notif__button-close(@click="close")
          icon.cross-mark(:name="'cross-mark'")
      .notif__text-row
        //- p.notif__text {{ text | maxLength }}
        p.notif__text(v-html="text")

</template>

<script>
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'notification',
    props: {
      id: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        default: 'Error',
        validate(value) {
          return value === 'error'
            || value === 'warn'
            || value === 'info';
        },
      },
      text: {
        required: true,
      },
    },
    data() {
      return {
        timeout: null,
        title: {
          error: 'Error',
          warn: 'Warning',
          info: 'Information',
        },
      };
    },
    filters: {
      maxLength(text) {
        return text.length > 150 ? `${text.slice(0, 150)}...` : text;
      },
    },
    components: {
      icon,
    },
    methods: {
      close() {
        return this.$emit('close', this.id);
      },
      getClass() {
        return `notif--${this.type}`;
      },
    },
    mounted() {
      this.timeout = setTimeout(() => {
        this.$emit('close', this.id);
      }, 5000);
    },
    destroyed() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    },
  };
</script>

<style lang="sass">
  @import "./notification"
</style>

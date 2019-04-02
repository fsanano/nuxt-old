<template lang="pug">
  .form__row
    input(
      ref="input"
      :type="type"
      :name="name"
      :value="value"
      :placeholder="$t(`form.field.${name}`)"
      :class="{'invalid': errors[name].length}"
      @keypress="isNumber"
      @input="updateValue(name, $event.target.value)"
    ).form__input

</template>

<script>
  export default {
    name: 'formfield',

    props: {
      type: {
        type: String,
        required: true,
      },
      value: {
        type: [String, Number],
        required: false,
      },
      name: {
        type: String,
        required: true,
      },
      onlyNumbers: {
        type: Boolean,
        required: false,
        default: false,
      },
      errors: {
        type: Object,
        required: true,
      },
    },

    data() {
      return {};
    },

    methods: {
      updateValue(name, value) {
        this.errors[name] = [];
        if (this.onlyNumbers) {
          const str = value.toString();
          if (value % 1 !== 0) {
            const digitsAfterDots = str.includes('.')
              ? (str.split('.').pop())
              : 0;

            if (digitsAfterDots) {
              if (digitsAfterDots.length > 2) {
                this.$store.dispatch('notifications/addNotification', {
                  type: 'warn',
                  text: this.$t('notification.index.coin.error.decimal'),
                });
                return false;
              }
            }
          }
        }
        this.$emit('input', value);
        return true;
      },

      isNumber(evt) {
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
          if (this.onlyNumbers) {
            evt.preventDefault();
            return false;
          }
        }
        return true;
      },
    },
  };
</script>

<style>

</style>

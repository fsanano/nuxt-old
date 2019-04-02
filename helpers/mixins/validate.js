export default {
  data() {
    return {
      keepSigned: false,
      maxLength: 255,
      errorsMsg: {
        empty: this.$t('form.validation.empty'),
        invalidEmail: this.$t('form.validation.invalidEmail'),
        noMatch: this.$t('form.validation.noMatch'),
        short: this.$t('form.validation.short'),
      },
    };
  },

  methods: {
    resetErrors() {
      Object.keys(this.errors).forEach((key) => {
        this.errors[key] = [];
      });
      this.validate();
    },

    notif(msg) {
      this.$store.dispatch('notifications/addNotification', {
        type: 'error',
        text: msg,
      });
    },

    validate() {
      Object.keys(this.form).forEach((key) => {
        const val = this.form[key];
        const err = this.errors[key];

        if (!val) {
          err.push('empty');

          this.notif(this.$t('form.validation.empty', { field: key }));
        }

        if (val.length > this.maxLength) {
          err.push('long');

          this.notif(this.$t('form.validation.long', { field: key }));
        }

        if (key === 'name') {
          this.validateName(val);
        }

        if (key === 'email') {
          this.validateEmail(val);
        }
      });

      if (this.errors.password_confirmation !== undefined) {
        if (this.form.password.length < 6) {
          this.errors.password.push('short');
          this.notif(this.$t('form.validation.short', { field: 'password' }));
        }

        if (this.form.password !== this.form.password_confirmation) {
          this.errors.password.push('noMatch');
          this.notif(this.$t('form.validation.noMatch'));
        }
      }
      this.countErrors();
    },

    validateName(name) {
      if (name.length < 3) {
        this.errors.name.push('short');
        this.notif(this.$t('form.validation.short', { field: 'name' }));
      }
    },

    validateEmail(email) {
      const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;

      if (!re.test(email.toLowerCase())) {
        this.errors.email.push('invalidEmail');
        this.notif(this.$t('form.validation.invalidEmail'));
      }
    },

    countErrors() {
      const errors = Object.values(this.errors);

      const count = errors.reduce((sum, current) => sum + current.length, 0);

      if (count === 0) {
        this.auth();
      }
    },

    setCookie(jwt) {
      let days;
      if (this.keepSigned) {
        days = 30;
      } else {
        days = 1;
      }
      this.$cookie.set('jwt', jwt, days);
    },
  },
};

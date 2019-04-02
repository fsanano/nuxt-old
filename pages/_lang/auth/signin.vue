<template lang="pug">
  .page__container
    .form__container
      h1.form__title(v-html="$t('form.signin.title')")
      form(@submit.prevent="resetErrors").form__form

        formfield(
        type="email"
        name="email"
        :errors="errors"
        v-model="form.email"
        )

        formfield(
        type="password"
        name="password"
        :errors="errors"
        v-model="form.password"
        )

        .form__row.d-flex.justify-content-between.align-items-center
          button.form__btn(v-html="$t('form.submit')")
          input-checkbox(
          :id="'signin'",
          :label="$t('form.keepMe')",
          v-model="keepSigned"
          )

      .form__bottom.d-flex.justify-content-between.align-items-center
        // nuxt-link(to="" v-html="$t('form.forgot.password')").form__txt
        span.form__txt(v-html="$t('form.signin.label')")
        nuxt-link(:to="$i18n.path('auth/signup')" v-html="$t('form.signup.title')").form__link

</template>

<script>
  import { mapState } from 'vuex';
  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import formfield from '~/components/ui/input/formfield.vue';
  import validate from '~/helpers/mixins/validate';

  export default {
    name: 'signin',
    layout: 'base',

    mixins: [validate],

    head() {
      return {
        title: this.$t('meta.pages.signin.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.signin.title'),
          },
        ],
      };
    },

    data() {
      return {
        form: {
          email: '',
          password: '',
        },
        errors: {
          email: [],
          password: [],
        },
      };
    },

    components: {
      inputCheckbox,
      formfield,
    },

    methods: {
      async auth() {
        const { data } = await this.$store.dispatch('auth/signin', this.form);

        if (data.result) {
          this.setCookie(data.data.token);

          this.$store.dispatch('notifications/addNotification', {
            type: 'info',
            text: this.$t('notification.auth.signin.success'),
          });

          if (data.data.status === 'pending') {
            this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: this.$t('notification.auth.verify'),
            });
          }

          this.$router.push({
            path: `/${this.locale}/auth/personal`,
          });
        }
      },
    },

    computed: {
      ...mapState({
        locale: state => state.common.locale,
      }),
    },
  };
</script>

<style lang="sass">
  @import "~assets/sass/blocks/form.sass";
</style>

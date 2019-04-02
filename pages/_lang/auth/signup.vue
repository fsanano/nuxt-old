<template lang="pug">
  .page__container
    .form__container
      h1.form__title(v-html="$t('form.signup.title')")
      form(@submit.prevent="resetErrors").form__form

        formfield(
        type="text"
        name="name"
          :errors="errors"
        v-model="form.name"
        )
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
        formfield(
        type="password"
        name="password_confirmation"
          :errors="errors"
        v-model="form.password_confirmation"
        )

        .form__row.d-flex.justify-content-between.align-items-center
          button.form__btn(v-html="$t('form.submit')")
          input-checkbox(
          :id="'signup'",
          :label="$t('form.keepMe')"
          v-model="keepSigned"
          )

      .form__bottom.d-flex.justify-content-start.align-items-center
        span.form__txt(v-html="$t('form.signup.label')")
        | &nbsp;
        nuxt-link(:to="$i18n.path('auth/signin')" v-html="$t('form.signin.link')").form__link

</template>

<script>
  import { mapState } from 'vuex';
  import inputCheckbox from '~/components/ui/input/checkbox.vue';
  import formfield from '~/components/ui/input/formfield.vue';
  import validate from '~/helpers/mixins/validate';

  export default {
    layout: 'base',
    name: 'signup',

    mixins: [validate],

    head() {
      return {
        title: this.$t('meta.pages.signup.title'),
        meta: [
          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.$t('meta.pages.signup.title'),
          },
        ],
      };
    },

    data() {
      return {
        form: {
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
        },

        errors: {
          name: [],
          email: [],
          password: [],
          password_confirmation: [],
        },

      };
    },

    components: {
      inputCheckbox,
      formfield,
    },

    methods: {
      async auth() {
        const { data } = await this.$store.dispatch('auth/signup', this.form);

        if (data.result) {
          this.setCookie(data.data.token);

          await this.$store.dispatch('notifications/addNotification', {
            type: 'info',
            text: this.$t('notification.auth.signup.success'),
          });

          await this.$store.dispatch('notifications/addNotification', {
            type: 'warn',
            text: this.$t('notification.auth.verify'),
          });

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

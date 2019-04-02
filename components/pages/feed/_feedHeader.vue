<template lang="pug">
  .news__header.d-flex.flex-wrap.justify-content-between.align-items-center
    template(v-if="currentCategoryTitle")
      h1.news__header-title {{ currentCategoryTitle }}
    template(v-else-if="currentTagName")
      h1.news__header-title(v-html="$t('postsListPage.tagTitle', { tag : currentTagName })")
    template(v-else)
      h1.news__header-title(v-html="getDefaultNavTitle()")

    .news__socials
      a(href="https://www.facebook.com/ICEX.CH/", target="_blank")
        icon(name="fb").news__social
      a(href="https://vk.com/icexch", target="_blank")
        icon(name="vk").news__social
      a(href="https://www.instagram.com/icex.ch/", target="_blank")
        icon(name="ig").news__social
      a(href="https://t.me/icexch", target="_blank")
        icon(name="tg").news__social
      a(href="https://twitter.com/icex_ch", target="_blank")
        icon(name="tw").news__social
</template>

<script>
  import icon from '~/components/ui/icon.vue';

  import i18n from './i18n.json';

  export default {
    name: 'feed-header',
    props: {
      currentCategoryTitle: {
        type: String,
        default: '',
      },
      currentTagName: {
        type: String,
        default: '',
      },
    },
    components: {
      icon,
    },
    methods: {
      getDefaultNavTitle() {
        return `${this.$t('postsListPage.title')} <span class="red">${this.$t('postsListPage.live')}</span>`;
      },
    },
    computed: {
      routeLang() {
        return this.$route.params.lang;
      },
      routeCategory() {
        return this.$route.params.category || null;
      },
    },
    i18n,
  };
</script>

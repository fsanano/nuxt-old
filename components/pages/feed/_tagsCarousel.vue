<template lang="pug">
  nav.news__menu.news__menu--tags
    no-ssr
      flickity(ref="flickity", :options="flickityOptions")
        div(v-for="tag in tags")
          nuxt-link.d-block.menu__item.denim(
          :key="tag.slug",
          :to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang }}"
          ) {{ tag.name }}
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'tags-carousel',
    data() {
      return {
        resizeTimeout: 0,
        flickityOptions: {
          cellAlign: 'left',
          freeScroll: true,
          prevNextButtons: true,
          pageDots: false,
        },
      };
    },
    computed: {
      ...mapState({
        tags: state => state.news.tags,
      }),
      routeLang() {
        return this.$route.params.lang;
      },
    },
    mounted() {
      this.resizeTimeout = setTimeout(() => {
        this.$refs.flickity.resize();
      }, 1000);
    },
    beforeDestroy() {
      clearTimeout(this.resizeTimeout);
    },
  };
</script>

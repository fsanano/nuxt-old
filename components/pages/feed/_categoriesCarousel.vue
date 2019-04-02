<template lang="pug">
  nav.news__menu
    no-ssr
      flickity(ref="flickity", :options="flickityOptions")
        div(v-for="category in categories")
          nuxt-link.d-block.menu__item(
          :key="category.slug",
          :class=[{ 'active': routeCategory }],
          :to="{ name: 'lang-feed-category', params: { category: category.slug, lang: routeLang }}"
          ) {{ category.name }}
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'categories-carousel',
    data() {
      return {
        resizeTimeout: 0,
        flickityOptions: {
          cellAlign: 'left',
          freeScroll: true,
          prevNextButtons: false,
          pageDots: false,
        },
      };
    },
    computed: {
      ...mapState({
        categories: state => state.news.categories,
      }),
      routeLang() {
        return this.$route.params.lang;
      },
      routeCategory() {
        return this.$route.params.category || null;
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

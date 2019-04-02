<template lang="pug">
  .news__container

    feed-header(
    :currentCategoryTitle="currentCategory.title",
    :currentTagName="currentTag.title",
    )

    categories-carousel

    tags-carousel

    template(v-if="postsPerPage.length > 0")
      .news__wrap.row.justify-content-between
        .col-12.col-md-9
          article.news__banner
            nuxt-link(:to="{ name: 'lang-feed-category-post', params: { post: `${postBanner.id}-${postBanner.title.slug}`, category: postBanner.category.slug, lang: routeLang }}")
              .news__date {{ postBanner.created_at | formatDate }}
              .news__img
                img(:src="postBanner.image", :alt="postBanner.title.name", :title="postBanner.title.name")
                .banner__content
                  no-ssr
                    .banner__labels.d-flex.flex-wrap
                      template(v-for="tag in postBanner.tags.slice(0, 5)")
                        nuxt-link(:to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang } }")
                          .banner__label.mr-1 {{ tag.name }}
                  .banner__title(v-html="postBanner.title.name")
                  .news__desc(v-html="formatTextPreview(postBanner.content)")

        template(v-if="postAside")
          .col-12.col-md-3
            article.news__aside
              nuxt-link(:to="{ name: 'lang-feed-category-post', params: { post: `${postAside.id}-${postAside.title.slug}`, category: postAside.category.slug, lang: routeLang }}")
                .news__date  {{ postAside.created_at | formatDate }}
                .news__img(v-if="postAside.image")
                  img(:src="postAside.image", :alt="postAside.title.name", :title="postAside.title.name")
                no-ssr
                  .d-flex.flex-wrap
                    template(v-for="tag in postAside.tags.slice(0, 3)")
                      nuxt-link(:to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang } }")
                        .news__label.mr-1 {{ tag.name }}
                .news__title(v-html="postAside.title.name")
                .news__desc(v-html="formatTextPreview(postAside.content)")

      .news__list.row
        template(v-if="postsGrid.length > 0")
          template(v-for="post in postsGrid")
            article.news__item.col-12.col-md-6.col-lg-3
              nuxt-link(:to="{ name: 'lang-feed-category-post', params: { post: `${post.id}-${post.title.slug}`, category: post.category.slug, lang: routeLang }}")
                .news__date {{ post.created_at | formatDate }}
                .news__img(v-if="post.image")
                  img(:src="post.image", :alt="post.title.name", :title="post.title.name")
                no-ssr
                  .d-flex.flex-wrap
                    template(v-for="tag in post.tags.slice(0, 3)")
                      nuxt-link(:to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang } }")
                        .news__label.mr-1 {{ tag.name }}
                .news__title(v-html="post.title.name")
                .news__desc(v-html="formatTextPreview(post.content)")

      template(v-if="pagination")
        transition(appear, name="fade")
          .pagination__container.pb-3
            template(v-if="showPrevPageButton")
              button.pagination__btn.__prev(@click="goToPage(currentPage - 1)")
            template(v-for="n in Math.round(pagination.total / newsPerPage)")
              button.pagination__page(
              :active="n === routePage"
              @click="goToPage(n)"
              ) {{ n }}
            template(v-if="showNextPageButton")
              button.pagination__btn.__next(@click="goToPage(currentPage + 1)")

    nuxt-child

</template>

<script>
  import { mapState } from 'vuex';
  import get from 'lodash.get';
  import moment from 'moment';
  import icon from '~/components/ui/icon.vue';

  import i18n from './i18n.json';
  import feedHeader from './_feedHeader.vue';
  import CategoriesCarousel from './_categoriesCarousel.vue';
  import TagsCarousel from './_tagsCarousel.vue';

  // TODO: fix no-ssr tags rendering (mismatching DOM Nodes)

  export default {
    layout: 'base',
    name: 'feed-list',
    watchQuery: ['page'],
    head() {
      const link = [];
      const meta = [];

      const pageType = this.$route.fullPath.includes('tags') ? 'tag' : 'category';

      if (pageType === 'tag') {
        meta.push(
          {
            hid: 'title',
            name: 'title',
            content: this.$t('postsListPage.meta.tags.title', { tag: this.currentTag.name }),
          },
          {
            hid: 'description',
            name: 'description',
            content: this.$t('postsListPage.meta.tags.desc', { tag: this.currentTag.name }),
          },
        );
      } else {
        meta.push(
          {
            hid: 'title',
            name: 'title',
            content: get(this.currentCategory, 'title', this.$t('postsListPage.meta.category.title')),
          },
          {
            hid: 'description',
            name: 'description',
            content: get(this.currentCategory, 'desc', this.$t('postsListPage.meta.category.desc')),
          },
        );
      }

      // og:meta tags
      // the rest in the base.vue
      meta.push(
        {
          hid: 'og:image',
          name: 'og:image',
          content: get(this.postBanner, 'image', ''),
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.$t('postsListPage.meta.category.title'),
        },
      );

      if (!this.routeTags && this.routePage > 1) {
        const [href] = this.href.split('?');

        link.push({
          hid: 'canonical',
          rel: 'canonical',
          href,
        });
      }

      const title = pageType === 'tag' ?
        this.$t('postsListPage.meta.tags.title', { tag: this.currentTag.name }) :
        get(this.currentCategory, 'title', this.$t('postsListPage.meta.category.title'));

      return {
        title,
        meta,
        link,
        __dangerouslyDisableSanitizers: ['script'],
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(this.$schemaBuilder().organizationData),
          },
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(this.$schemaBuilder().webSiteData),
          },
        ],
      };
    },
    async asyncData({
      store,
      params,
      error,
      query,
      env,
      route,
      redirect,
    }) {
      await store.dispatch('common/setLoaderStatus', true);
      const href = env.APP_BASE_URL + route.path;
      const pageType = route.fullPath.includes('tags') ? 'tag' : 'category';
      const lang = store.state.common.locales[store.state.common.locale].desc || 'eng';
      const { category = null, tag = null } = params;

      /**
       * If it's tags page but no tag presented in query - just redirect user no matter what
       */
      if (pageType === 'tag' && !tag) {
        return redirect(301, route.path.split('/tags')[0]);
      }

      const { page } = query;
      const responseCategories = await store.dispatch('news/fetchCategories', {
        lang,
      });

      const responseTags = await store.dispatch('news/fetchTags', {
        lang,
      });

      if (!responseCategories.data.result) {
        return error({ statusCode: 503, message: 'Cannot fetch categories. News API is unavailable now.' });
      }

      if (!responseTags.data.result) {
        return error({ statusCode: 503, message: 'Cannot fetch tags list. News API is unavailable now.' });
      }

      const allowedCategories = [null, ...responseCategories.data.data.map(el => el.slug)];
      const allowedTags = [null, ...responseTags.data.data.map(el => el.slug)];

      if (pageType === 'category' && allowedCategories.findIndex(el => el === category) === -1) {
        return error({ statusCode: 404, message: 'This category does not exist' });
      } else if (allowedTags.findIndex(el => el === tag) === -1) {
        return error({ statusCode: 404, message: 'This tag does not exist' });
      }

      const currentCategory = responseCategories.data.data.find(el => el.slug === category) || {};
      const currentTag = responseTags.data.data.find(el => el.slug === tag) || {};

      const posts = await store.dispatch('news/fetchAll', {
        limit: 6,
        status: 'published',
        detail: true,
        lang,
        category,
        tags: tag,
        page,
      });

      if (!posts.data.result) {
        return error({ statusCode: 503, message: 'Cannot fetch news. News API is unavailable now.' });
      }

      const postsPerPage = posts.data.data;
      const [postBanner, postAside, ...postsGrid] = postsPerPage;

      // TODO: fix this shit
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }

      return {
        href,
        currentCategory,
        currentTag,
        postsPerPage,
        postAside,
        postBanner,
        postsGrid,
        newsPerPage: 6,
        maxTagsInNewsPreview: 3,
        resizeTimeout: 0,
      };
    },
    components: {
      feedHeader,
      TagsCarousel,
      CategoriesCarousel,
      icon,
    },
    filters: {
      formatDate(str) {
        return moment(str, 'YYYY-MM-DD HH:mm:ss', true).format('D MMM YY / HH:mm');
      },
    },
    watch: {
      async lang(value) {
        const newsParams = {
          limit: 6,
          status: 'published',
          detail: true,
          lang: value,
          category: this.routeCategory,
          tags: this.routeTags,
          page: this.routePage,
        };
        const promises = [];

        promises.push(
          this.$store.dispatch('news/fetchAll', newsParams),
          this.$store.dispatch('news/fetchCategories', { lang: value }),
          this.$store.dispatch('news/fetchTags', { lang: value }),
        );

        await Promise.all(promises);
      },
    },
    methods: {
      formatTextPreview(str) {
        return str.length > 100
          ? `${str.replace(/<[^>]+>/g, '').slice(0, 100)}...`
          : str;
      },
      goToPage(n) {
        this.$router.push({
          query: {
            page: n,
          },
        });
      },
      getPaginationArray(current, max, length = 5) {
        const res = [];
        const minEndRow = max - (length - 2);
        const maxStartRow = length - 1;

        if (max <= length) {
          for (let i = 1; i <= max; i += 1) {
            res.push(i);
          }

          return res;
        }

        if (current <= maxStartRow) {
          for (let i = 1; i <= length - 1; i += 1) {
            res.push(i);
          }
          res.push('...');
          res.push(max);

          return res;
        } else if (current >= minEndRow) {
          res.push(1);
          res.push('...');
          for (let i = max - (length - 2); i <= max; i += 1) {
            res.push(i);
          }

          return res;
        }

        res.push(1);
        res.push('...');
        for (
          let i = current - Math.ceil(Math.abs(length - 4) / 2);
          i <= current + Math.ceil(Math.abs(length - 4) / 2);
          i += 1
        ) {
          res.push(i);
        }
        res.push('...');
        res.push(max);

        return res;
      },
    },
    computed: {
      ...mapState({
        tags: state => state.news.tags,
        lang: state => state.common.locales[state.common.locale].desc || 'eng',
        categories: state => state.news.categories,
        posts: state => state.news.posts,
        pagination: state => state.news.pagination,
        currentPage: state => state.news.pagination && state.news.pagination.current_page,
      }),
      routeCategory() {
        return this.$route.params.category || null;
      },
      routePage() {
        return this.$route.query.page || 1;
      },
      routeLang() {
        return this.$route.params.lang;
      },
      routeTags() {
        return this.$route.query.tags || null;
      },
      showNextPageButton() {
        return this.pagination.next_page_url;
      },
      showPrevPageButton() {
        return this.pagination.prev_page_url;
      },
    },
    mounted() {
      this.resizeTimeout = setTimeout(() => this.$store.dispatch('common/setLoaderStatus', false), 1000);
    },
    beforeDestroy() {
      clearTimeout(this.resizeTimeout);
    },
    i18n,
  };
</script>

<style lang="scss">
  @import '~assets/sass/blocks/news.sass';
</style>

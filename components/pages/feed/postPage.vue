<template lang="pug">
  .news__container

    feed-header

    categories-carousel

    tags-carousel

    .news__wrap.row.justify-content-between
      .col-12.col-md-9
        article.news__banner.__full
          .news__img(v-if="post.image")
            img(:src="post.image", :alt="post.title.name", :title="post.title.name")

          .news__content
            //- .news__img-desc Посольство мексики Сингапур Фото: globallookpress.com
            .news__date.__unlabel {{ post.created_at | formatDate }}
            h1.news__title.__large(v-html="post.title.name")

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
            br
            br
            no-ssr
              .banner__labels.d-flex.flex-wrap
                template(v-for="tag in post.tags")
                  nuxt-link(:to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang } }")
                    .banner__label.mr-1.mb-1 {{ tag.name }}

            br

            .news__desc(v-html="post.content")

      .col-12.col-md-3
        .news__aside
          template(v-for="post in postsAside")
            article.news__item
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

    .row
      .row
        .news__list.news__list--suggested
          .row.no-gutters
            template(v-for="post, index in postsBottom")
              article.news__item.col-12.col-md-6.px-4.py-2
                nuxt-link(:to="{ name: 'lang-feed-category-post', params: { post: `${post.id}-${post.title.slug}`, category: post.category.slug, lang: routeLang }}")
                  .row
                    .col-12
                      p.mb-2(style="color: #667180;") Также по теме
                    .col-12.col-md-6
                      .news__date {{ post.created_at | formatDate }}
                      .news__img(v-if="post.image")
                        img(:src="post.image", :alt="post.title.name", :title="post.title.name")
                    .col-12.col-md-6
                      no-ssr
                        .d-flex.flex-wrap
                          template(v-for="tag in post.tags.slice(0, 3)")
                            nuxt-link(:to="{ name: 'lang-feed-tags-tag', params: { tag: tag.slug, lang: routeLang } }")
                              .news__label.mr-1 {{ tag.name }}
                      .news__title(v-html="post.title.name")
                      .news__desc(v-html="formatTextPreview(post.content)")

</template>

<script>
  import moment from 'moment';
  import icon from '~/components/ui/icon.vue';
  import { mapState } from 'vuex';

  import feedHeader from './_feedHeader.vue';
  import CategoriesCarousel from './_categoriesCarousel.vue';
  import TagsCarousel from './_tagsCarousel.vue';

  export default {
    layout: 'base',
    name: 'feed-post',
    scrollToTop: true,
    head() {
      const articleData = {
        '@context': 'http://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${this.$schemaBuilder().origin}/${this.$route.fullPath}`,
        },
        headline: this.post.title.name,
        image: [
          this.post.image,
        ],
        datePublished: this.post.created_at,
        dateModified: this.post.updated_at,
        author: this.$schemaBuilder().organizationData,
        publisher: this.$schemaBuilder().organizationData,
        // description: 'A most wonderful article',
      };

      const breadCrumbs = {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': `${this.$schemaBuilder().origin}/${this.routeLang}/feed`,
              name: this.$t('feed.feed'),
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': `${this.$schemaBuilder().origin}/${this.routeLang}/feed/${this.post.category.slug}`,
              name: this.post.category.name,
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': `${this.$schemaBuilder().origin}/${this.routeLang}/feed/${this.post.category.slug}/${this.post.id}-${this.post.title.slug}`,
              name: this.post.title.name,
            },
          },
        ],
      };

      return {
        title: this.post.title.name,
        meta: [
          {
            hid: 'title',
            name: 'title',
            content: this.post.title.name,
          },
          {
            hid: 'description',
            name: 'description',
            content: this.formatTextPreview(this.post.content),
          },

          // og:meta tags
          // the rest in the base.vue
          {
            hid: 'og:title',
            name: 'og:title',
            content: this.post.title.name,
          },

          {
            hid: 'og:image',
            name: 'og:image',
            content: this.post.image,
          },
        ],
        __dangerouslyDisableSanitizers: ['script'],
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(articleData),
          },
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(breadCrumbs),
          },
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
    async asyncData({ store, params, error }) {
      store.dispatch('common/setLoaderStatus', true);
      const slug = params.post;
      const [id] = slug.split('-');
      const lang = store.state.common.locales[store.state.common.locale].desc || 'eng';

      const post = await store.dispatch('news/fetchByID', {
        id,
        params: {
          lang,
        },
      });

      if (!post.data.result && post.data.errors.request[0]) {
        return error({ statusCode: 503, message: 'Cannot fetch post data. News API is unavailable now.' });
      }

      await store.dispatch('news/fetchCategories', {
        lang,
      });
      await store.dispatch('news/fetchTags', {
        lang,
      });

      if (!post.data.result) {
        return error({ statusCode: 404, message: 'No such post in database' });
      }

      const tags = [...post.data.data.tags.map(el => el.slug)];
      const randomTags = [
        tags.splice(Math.floor(Math.random() * tags.length), 1).toString(),
        tags.splice(Math.floor(Math.random() * tags.length), 1).toString(),
      ];

      // Fetch two newest posts
      const aside = await store.dispatch('news/fetchAll', {
        limit: 2,
        detail: true,
        status: 'published',
        exclude: id,
        lang,
      });

      let exclude = [id, ...Object.values(aside.data.data).map(el => el.id)].toString();

      // TODO: rewrite this shit later
      const postBottomFirst = await store.dispatch('news/fetchAll', {
        limit: 1,
        detail: true,
        status: 'published',
        tags: randomTags[0],
        lang,
        exclude,
      });

      exclude = [exclude, ...postBottomFirst.data.data.map(el => el.id)].toString();

      const postBottomSecond = await store.dispatch('news/fetchAll', {
        limit: 1,
        detail: true,
        status: 'published',
        tags: randomTags[1],
        lang,
        exclude,
      });

      store.dispatch('common/setLoaderStatus', false);

      return {
        post: post.data.data,
        postsAside: aside.data.data,
        postsBottom: [...postBottomFirst.data.data, ...postBottomSecond.data.data],
        postDefault: {
          title: '',
          content: '',
          tags: [],
          image: '',
          created_at: '',
        },
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
      routeParamPost: {
        handler() {
          return typeof window !== 'undefined'
            ? window.scrollTo(0, 0)
            : false;
        },
        immediate: true,
      },
      async lang(value) {
        const promises = this.ids.map(async id => this.$store.dispatch('news/fetchByID', {
          id,
          params: {
            lang: value,
          },
        }));

        await Promise.all(promises);

        await this.$store.dispatch('news/fetchCategories', {
          lang: value,
        });

        await this.$store.dispatch('news/fetchTags', {
          lang: value,
        });
      },
    },
    methods: {
      formatTextPreview(str) {
        return str.length > 100
          ? `${str.replace(/<[^>]+>/g, '').slice(0, 100)}...`
          : str;
      },
    },
    computed: {
      ...mapState({
        categories: state => state.news.categories,
        tags: state => state.news.tags,
        lang: state => state.common.locales[state.common.locale].desc || 'eng',
      }),
      routeParamPost() {
        return this.$route.params.post;
      },
      routeCategory() {
        return this.$route.params.category || null;
      },
      routeLang() {
        return this.$route.params.lang;
      },
      ids() {
        return [
          this.post.id,
          ...this.postsAside.map(el => el.id),
          ...this.postsBottom.map(el => el.id),
        ];
      },
    },
    validate({ params }) {
      const slug = params.post;
      const [id, title] = slug.split('-');

      return Number.isInteger(parseInt(id, 10)) && !!title;
    },
  };
</script>

<style lang="scss">
  @import '~assets/sass/blocks/news.sass';
</style>

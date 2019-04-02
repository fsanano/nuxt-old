const webpack = require('webpack');
const axios = require('axios');

module.exports = {
  env: {
    GIT_HASH: process.env.GIT_HASH,
    GIT_HASH_SHORT: process.env.GIT_HASH_SHORT,
    WS_URL: process.env.WS_URL || 'https://api.icex.ch:6001',
    LARAVEL_ECHO_TOKEN: process.env.LARAVEL_ECHO_TOKEN || '4e43bbcdb9f0dfc537629cd5b322b74f',
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.icex.ch/api',
    APP_BASE_URL: process.env.APP_BASE_URL || 'https://app.icex.ch',
    NEWS_API_BASE_URL: process.env.NEWS_API_BASE_URL || 'https://news.icex.ch',
  },
  /*
  ** Headers of the page
  */
  head: {
    // __dangerouslyDisableSanitizers: ['script'],
    title: 'icex-app',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ICEX - инструмент анализа, сравнения и отслеживания показателей Криптовалют. Собирайте свой криптовалютный портфель, анализируйте показатели, зарабатывайте проще и быстрее.' },
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#ffffff' },
      { name: 'google-site-verification', content: '6n1fYbPWKwT-uzbnjc75FZmK5yJ5izYEyabLkgrxR90' },
      { name: 'yandex-verification', content: '1dec115f78d27564' },
      { hid: 'title', name: 'title', content: 'Индексы Криптовалют онлайн - График, Анализ, Курс, Капитализация - ICEX' },
    ],
    script: [
      // { src: 'https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.0.3/cookieconsent.min.js' }
    ],
    link: [
      { rel: 'icon', sizes: '32x32', href: '/favicons/favicon-32x32.png' },
      { rel: 'icon', sizes: '16x16', href: '/favicons/favicon-16x16.png' },
      { rel: 'mask-icon', href: '/favicons/safari.svg', color: '#0b50cd' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/apple-touch-icon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700&amp;subset=cyrillic' },
      // { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.0.3/cookieconsent.min.css' },
    ],
  },
  /*
  ** Customize the progress bar color
  */
  loading: '~/components/ui/loader.vue',
  /*
  ** Styles
  */
  css: [
    { src: 'assets/sass/base.sass', lang: 'sass' },
    { src: 'node_modules/bootstrap/scss/bootstrap.scss', lang: 'sass' },
    { src: 'node_modules/vue-multiselect/dist/vue-multiselect.min.css', lang: 'css' },
  ],
  /*
  ** Build configuration
  */
  build: {

    extend(config) {
      const rule = config.module.rules.find(r => r.test.toString() === '/\\.(png|jpe?g|gif|svg)$/');
      config.module.rules.splice(config.module.rules.indexOf(rule), 1);

      // add it again, but now without 'assets\/svg'
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        exclude: /(assets\/img)/,
        query: {
          limit: 1000, // 1KO
          name: 'img/[name].[hash:7].[ext]',
        },
      });

      config.module.rules.push({
        test: /\.svg$/,
        include: /assets\/img/,
        use: 'svg-sprite-loader',
      });
    },

    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],

    vendor: [
      'babel-polyfill',
      'vue-i18n',
      'vue-js-modal',
      'v-click-outside',
      'v-tooltip',
      'vue-flickity',
      'moment',
    ],
  },

  router: {
    middleware: [
      'i18n',
      'checkBrowser',
      // uncomment string below to close site to maintenance
      // 'maintenance',
      'validateRouteParams',
      'removeTrailingSlash',
      // comment auth middleware in case all user indices are broken
      'auth',
    ],
    scrollBehavior(to, from, pos) {
      const layout = document.querySelector('.layout__content');

      if (layout) {
        layout.scrollTop = 0;
      }
    },
  },

  debug: true,

  plugins: [
    { src: '~/plugins/i18n.js', ssr: true },
    { src: '~/plugins/testAPI.js', ssr: true },
    { src: '~/plugins/schemaBuilder.js', ssr: true },

    // echo plugin must goes exactly after i18n plugin because echo uses some i18n functionality
    { src: '~/plugins/echo.js', ssr: true },
    { src: '~/plugins/testSockets.js', ssr: true },
    { src: '~/plugins/element.js', ssr: true },
    { src: '~/plugins/helpscout.js', ssr: false },
    { src: '~/plugins/tooltip', ssr: false },
    { src: '~/plugins/modal.js', ssr: false },
    { src: '~/plugins/loader.js', ssr: false },
    { src: '~/plugins/cookie.js', ssr: false },
    { src: '~/plugins/vueFlickity', ssr: false },
    { src: '~/plugins/vueScroll.js', ssr: true },
    { src: '~/plugins/vueMatchHeights', ssr: true },
    { src: '~/plugins/svgSpriteLoader', ssr: false },
    { src: '~/plugins/clickOutside.js', ssr: false },
    { src: '~/plugins/localStorage.js', ssr: false },
    { src: '~/plugins/cookieConsent.js', ssr: false },
    { src: '~/plugins/preventScroll.js', ssr: false },
    { src: '~/plugins/globalErrorHandler.js', ssr: true },
    { src: '~/plugins/globalWarningHandler.js', ssr: true },
    { src: '~/plugins/sentry.js', ssr: true },
  ],

  manifest: {
    background_color: '#eaf1f5',
    description: 'ICEX Indices is a simple and convenient tool for the analytic of the cryptocurrency market',
    display: 'standalone',
    icons: [],
    lang: 'en-US',
    name: 'ICEX Indices',
    orientation: 'portrait-primary',
    // scope: ''
    short_name: 'ICEX',
    start_url: '.',
    theme_color: '#0b50cd',
  },

  modules: [
    // '@nuxtjs/workbox',
    '@nuxtjs/manifest',
    '@nuxtjs/sitemap',
    'nuxt-trailingslash-module',
  ],

  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://app.icex.ch',
    cacheTime: 1000 * 60 * 15,
    generate: false, // Enable me when using nuxt generate
    routes (callback) {
      let routes = [];

      const locales = ['en', 'ru'];
      const staticRoutes = ['privacy', 'terms', 'faq', 'coins', 'indices'];

      const promises = [
        axios.get('https://api.icex.ch/api/fiat')
          .then(res => res.data.data.map(el => el.short)),
        axios.get('https://api.icex.ch/api/coins')
          .then(res => res.data.data),
        axios.get('https://api.icex.ch/api/index')
          .then(res => res.data.data.map(el => el.name)),
        axios.get('https://news.icex.ch/category')
          .then(res => res.data.data.map(el => el.slug)),
        axios.get('https://news.icex.ch/tags')
          .then(res => res.data.data.map(el => el.slug)),
        axios.get('https://news.icex.ch/news?limit=9999999&detail=true')
          .then(res => res.data.data.map(el => ({
            category: el.category.slug,
            id: el.id,
            title: el.title.slug,
          }))),
      ];

      Promise.all(promises)
        .then(([currencies, coins, indices, categories, tags, posts]) => {
          const localeCoin = locales.reduce((acc, k) => {
            coins.map(coin => acc.push(`${k}/coins/${coin}`));
            return acc;
          }, []);
          const localeIndex = locales.reduce((acc, k) => {
            indices.map(index => acc.push(`${k}/indices/${index}`));
            return acc;
          }, []);

          const localFeedCategory = locales.reduce((acc, locale) => {
            categories.map(category => acc.push(`/${locale}/feed/${category}`));
            return acc;
          }, []);

          const localeFeedTags = locales.reduce((acc, locale) => {
            tags.map(tag => acc.push(`/${locale}/feed/tags/${tag}`));
            return acc;
          }, []);

          const localeFeedCategoryPost = locales.reduce((acc, locale) => {
            posts.map(post => acc.push(`/${locale}/feed/${post.category}/${post.id}-${post.title}`));
            return acc;
          }, []);

          const localeStatic = locales.reduce((acc, locale) => {
            staticRoutes.map(route => acc.push(`/${locale}/${route}`));
            return acc;
          }, []);

          routes = [
            ...localeCoin,
            ...localeIndex,
            ...localFeedCategory,
            ...localeFeedTags,
            ...localeFeedCategoryPost,
            ...localeStatic,
          ];

          return callback(null, routes);
        });
    }
  }
};

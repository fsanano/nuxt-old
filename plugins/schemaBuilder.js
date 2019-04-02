/* eslint-disable no-shadow */
import Vue from 'vue';

export default ({ app, env }) => {
  function schemaBuilder() {
    const organizationData = {
      '@context': 'http://schema.org',
      '@type': 'Organization',
      name: 'INTERNATIONAL CRYPTOCURRENCY EXCHANGE',
      url: env.APP_BASE_URL,
      sameAs: [
        'https://www.facebook.com/ICEX.CH/',
        'https://www.instagram.com/icex.ch/',
        'https://twitter.com/icex_ch',
      ],
      logo: `${env.APP_BASE_URL}/img/logo.svg`,
    };
    const webSiteData = {
      '@context': 'http://schema.org',
      '@type': 'WebSite',
      url: env.APP_BASE_URL,
      name: 'INTERNATIONAL CRYPTOCURRENCY EXCHANGE',
    };

    return {
      organizationData,
      webSiteData,
      origin: env.APP_BASE_URL,
    };
  }

  const plugin = {
    install(Vue) {
      // console.log(schemaBuilder().webSiteData);
      Vue.prototype.$schemaBuilder = schemaBuilder;

      return Vue.prototype.$schemaBuilder;
    },
  };

  Vue.use(plugin);

  app.schemaBuilder = schemaBuilder;
};

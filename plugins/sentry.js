import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

// eslint-disable-next-line
export default ({ isDev, env }) => {
  // TODO: set if statement to isDev if you aren't on ICEX-666 branch!!!
  // eslint-disable-next-line
  if (!isDev) {
    Raven
      .config('https://5bfa570b07084396bff4c1daeca13b28@sentry.io/283028', {
        autoBreadcrumbs: {
          xhr: true,
          console: true,
          dom: true,
          location: true,
          sentry: true,
        },
        environment: 'production',
        release: env.GIT_HASH,
        stacktrace: true,
      })
      .addPlugin(RavenVue, Vue)
      .install();

    Raven.captureBreadcrumb({
      message: 'Session started',
      category: 'common',
      level: 'info', // error, warning, info, or debug.
    });
  }
};

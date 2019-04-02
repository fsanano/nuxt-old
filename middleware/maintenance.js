/**
 * Closes site to maintenance
 * To make this works - include this middleware in nuxt.config.js in router.middleware
 * before every other files
 * @param error
 * @param app
 * @return {*}
 */
export default function ({ error, app }) {
  return error({ statusCode: 401, message: app.i18n.t('siteIsUnderMaintenance') });
}


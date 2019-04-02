export default function ({
  isHMR,
  app,
  store,
  params,
}) {
  if (isHMR) return;
  const locale = params.lang || 'en';
  store.dispatch('common/setUserLocale', locale);
  app.i18n.locale = locale;
}

if (process.browser) {
  const files = require.context('~/assets/img/', true, /\.svg$/);
  files.keys().forEach(files);
}

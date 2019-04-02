/* eslint-disable */
export default function ({
  isHMR, app, store, route, params, error, redirect
}) {
  // function validate() {
  //   return {
  //     lang(lang) {
  //       const validValues = ['en', 'ru'];
  //       console.log('validating lang');
  //       if (validValues.findIndex(el => el === lang) === -1) {
  //         redirect(301, '/en/usd/indices');
  //       }
  //     },
  //     async currency(currency) {
  //       const { data } = await store.dispatch('common/fetchCurrenciesList');
  //       console.log('validating currency', data);
  //       if (data.findIndex(el => el === currency) === -1) {
  //         redirect(301, `/${params.lang}/usd/indices`);
  //       }
  //     },
  //   }
  // }
  //
  // validate().lang(params.lang);
  //
  // if (params.currency) {
  //   validate().currency(params.currency);
  // }
}

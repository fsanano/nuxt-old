import bowser from 'bowser';

export default function ({ req, redirect, store }) { // eslint-disable-line
  const header = (req && req.headers['user-agent']) || window.navigator.userAgent;
  const forceCheck = store.state.common.forceBrowserCheck;
  const isOldBrowser = bowser.isUnsupportedBrowser({
    chrome: '40',
    chromium: '40',
    firefox: '52',
    msie: '16',
    msedge: '16',
    safari: '10',
    opera: '43',
  }, true, header);

  if (isOldBrowser && !forceCheck) {
    return redirect(307, `/${store.state.common.locale}/old`);
  }

  return true;
}

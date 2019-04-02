export default async function ({ req, store, res }) {
  let cookiesString = '';
  if (process.server) {
    cookiesString = req.headers.cookie || '';
  } else {
    cookiesString = document.cookie || '';
  }

  const cookies = cookiesString.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});

  if (cookies.jwt && cookies.jwt.length > 0) {
    const { data } = await store.dispatch('auth/getUserData', cookies.jwt);

    if (!data.result || !data.data.token) {
      if (process.server) {
        res.setHeader('Set-Cookie', ['jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;']);
      } else {
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  }
};

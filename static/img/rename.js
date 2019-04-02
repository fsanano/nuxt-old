const fs = require('fs');

fs.readFile('icons.json', (error, data) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return;
  }

  const obj = JSON.parse(data);
  Object.keys(obj).forEach((p) => {
    fs.rename(`cryptoCoins/${p}.svg`, `cryptoCoins/${obj[p]}.svg`, (err) => {
      if (err) {
        console.log(`ERROR: ${err}`); // eslint-disable-line no-console
      }
    });
  });
});

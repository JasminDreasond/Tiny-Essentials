import fetch from 'node-fetch';

export default function getTextFetch() {
  const tinyArgs = arguments;
  return new Promise((resolve, reject) =>
    fetch
      .apply(fetch, tinyArgs)
      .then((response) => {
        // Get Response
        response
          .text()
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      }),
  );
}

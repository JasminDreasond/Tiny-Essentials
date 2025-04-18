import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import credentials from '../get/credentials.mjs';
import errorValidator from '../get/errorValidator.mjs';

export default function revokeToken(access_token, tinyAuth) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;
    const credentials = credentials(tinyAuth);

    // Response
    getJsonFetch(`${apiURL}oauth2/token/revoke`, {
      method: 'POST',
      body: new URLSearchParams({
        token: access_token,
      }),
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((data) => {
        // Error Validator
        const result = errorValidator(data);
        if (!result.error) resolve(result.data);
        else reject(result.error);
      })
      .catch((err) => {
        reject({ code: err.response.status, message: err.message });
      });
  });
}

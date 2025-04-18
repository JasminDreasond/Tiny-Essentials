import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

export default function refreshToken(dsData) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}oauth2/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: dsData.client_id,
        client_secret: dsData.client_secret,
        grant_type: 'refresh_token',
        code: dsData.code,
        refresh_token: dsData.refresh_token,
        redirect_uri: dsData.redirect_uri,
        scope: dsData.scope,
      }),
      headers: {
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

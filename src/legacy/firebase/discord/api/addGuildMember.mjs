import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

export default function addGuildMember(bot_token, data) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(
      `${apiURL}guilds/${encodeURIComponent(data.guild_id)}/members/${encodeURIComponent(data.user_id)}`,
      {
        method: 'PUT',
        body: new URLSearchParams({
          deaf: data.deaf,
          mute: data.mute,
          nick: data.nickname,
          roles: data.roles,
          access_token: data.access_token,
        }),
        headers: {
          Authorization: `Bot ${bot_token}`,
          'Content-Type': 'application/json',
        },
      },
    )
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

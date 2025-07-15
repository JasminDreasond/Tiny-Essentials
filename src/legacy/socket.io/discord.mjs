import getUser from '../firebase/discord/api/getUser.mjs';

/**
 * Handles the Discord OAuth2 authentication for a user, stores user data in an in-memory cache,
 * and manages the user's socket connection and disconnection events.
 *
 * @param {Record<string, any>} socket - The socket object representing the user's connection.
 * @param {Record<string, any>} ioCache - The shared cache that stores user data and connections.
 * @param {string} token - The OAuth2 token used to fetch user data from Discord.
 * @returns {Promise<Record<string, any>>} A promise that resolves with the user data and updates the cache.
 * @deprecated
 */
export default function discord(socket, ioCache, token) {
  return new Promise((resolve, reject) => {
    // Get Discord oAuth
    getUser(token)
      .then((user) => {
        // Create Users Cache
        if (!ioCache.users) ioCache.users = {};
        if (!ioCache.ids) ioCache.ids = {};
        if (typeof ioCache.totalUsers !== 'number') ioCache.totalUsers = 0;

        // User Data
        if (!ioCache.users[user.id]) {
          ioCache.users[user.id] = {
            ids: {},
          };

          ioCache.ids[socket.id] = user.id;
          ioCache.totalUsers++;
        }

        // Update Discord Data
        ioCache.users[user.id].data = user;

        // ID Data
        ioCache.users[user.id].ids[socket.id] = { socket: socket };

        // Disconnect
        socket.on('disconnect', function () {
          if (ioCache.users[user.id]) {
            // IDs
            delete ioCache.users[user.id].ids[socket.id];
            delete ioCache.ids[socket.id];

            if (Object.keys(ioCache.users[user.id].ids).length < 1) {
              delete ioCache.users[user.id];
              ioCache.totalUsers--;
            }
          }
        });

        // Complete
        resolve(ioCache.users[user.id]);
      })
      .catch(reject);
  });
}

import getUser from '@tinypudding/discord-oauth2/api/getUser';

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

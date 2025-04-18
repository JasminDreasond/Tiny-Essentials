import userIp from '../../http/userIP.mjs';

// Panel
const floodPanel = {};

setInterval(function () {
  // IP Cache
  for (const item in floodPanel) {
    floodPanel[item].timeout--;
    if (floodPanel[item].timeout < 0) delete floodPanel[item];
  }
}, 1000);

// Module
export default function verify(socket, ioCache) {
  // Get User IP
  const ip = userIp(socket.handshake);

  // Verify IP
  const verifyIP = function () {
    // Create Item
    if (!floodPanel[ip]) {
      floodPanel[ip] = {
        tries: 0,
        timeout: 2,
      };

      // Remove Ban
      const indexBan = ioCache.blocklick.indexOf(ip);
      if (indexBan > -1) ioCache.blocklick.splice(indexBan, 1);
    }

    // Add Try
    floodPanel[ip].tries++;

    // Gotha!
    if (floodPanel[ip].tries > 1000) {
      floodPanel[ip].timeout = 86400;
      ioCache.blocklick.push(ip);

      socket.disconnect();
    }
  };

  // Create Blacklist
  if (!Array.isArray(ioCache.blocklick)) {
    ioCache.blocklick = [];
  }

  // All Events
  var onevent = socket.onevent;
  socket.onevent = function (packet) {
    var args = packet.data || [];
    onevent.call(this, packet); // original call
    packet.data = ['*'].concat(args);
    onevent.call(this, packet); // additional call to catch-all
  };

  // Verify Action
  socket.on('*', function () {
    return verifyIP();
  });

  // First Verify
  return verifyIP();
}

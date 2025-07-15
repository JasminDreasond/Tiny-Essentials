import userIp from '../../http/userIP.mjs';

/** @typedef {Record<string, { timeout: number, tries: number }>} FloodTimeout */

/**
 * Panel
 *
 * @type {FloodTimeout}
 */

const floodPanel = {};

/**
 * Periodically decrements the timeout for each IP in the flood panel and removes expired entries.
 * This is set to run every second.
 */
setInterval(function () {
  // IP Cache
  for (const item in floodPanel) {
    floodPanel[item].timeout--;
    if (floodPanel[item].timeout < 0) delete floodPanel[item];
  }
}, 1000);

/**
 * Verifies the IP address of a user socket for flooding attempts.
 *
 * This function checks how many times an IP has attempted to interact with the socket.
 * If the attempts exceed a threshold, the IP is temporarily banned and disconnected.
 *
 * @param {Record<string, any>} socket - The socket object representing the connection.
 * @param {Object} ioCache - The cache object that holds the blocklist and flood panel data.
 * @param {Array<*>} ioCache.blocklick - The list of blocked IPs.
 * @returns {void} This function does not return anything, it modifies the floodPanel and blocklist.
 * @deprecated
 */
export default function verify(socket, ioCache) {
  // Get User IP
  const ipData = userIp(socket.handshake);
  const ip = ipData.value ? ipData.value[0] : '';

  /**
   * Verifies the IP for flooding attempts and manages timeout and blocklist.
   */
  const verifyIP = function () {
    // Create Item if it doesn't exist
    if (!floodPanel[ip]) {
      floodPanel[ip] = {
        tries: 0,
        timeout: 2,
      };

      // Remove Ban if any
      const indexBan = ioCache.blocklick.indexOf(ip);
      if (indexBan > -1) ioCache.blocklick.splice(indexBan, 1);
    }

    // Add Try for the current IP
    floodPanel[ip].tries++;

    // If tries exceed limit, block the IP
    if (floodPanel[ip].tries > 1000) {
      floodPanel[ip].timeout = 86400; // Set timeout to 24 hours
      ioCache.blocklick.push(ip); // Add to blocklist

      socket.disconnect(); // Disconnect the socket
    }
  };

  // Create Blocklist if it doesn't exist
  if (!Array.isArray(ioCache.blocklick)) {
    ioCache.blocklick = [];
  }

  // Catch-all Event Listener
  var onevent = socket.onevent;
  socket.onevent = function (/** @type {{ data: string[]; }} */ packet) {
    var args = packet.data || [];
    onevent.call(this, packet); // original call
    packet.data = ['*'].concat(args);
    onevent.call(this, packet); // additional call to catch-all
  };

  // Verify Action on All Events
  socket.on('*', function () {
    return verifyIP();
  });

  // First Verify IP
  return verifyIP();
}

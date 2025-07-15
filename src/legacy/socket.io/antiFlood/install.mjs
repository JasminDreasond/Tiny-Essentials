import userIp from '../../http/userIP.mjs';

/**
 * Installs the authorization middleware for socket connections.
 *
 * This middleware checks the user's IP address and allows or denies the socket connection based on whether
 * the IP is in the block list or not.
 *
 * @param {*} io - The Socket.IO server instance.
 * @param {Object} ioCache - The cache object containing blocked IPs.
 * @param {Array<*>} ioCache.blocklick - The list of blocked IP addresses.
 * @returns {void} This function does not return a value, it just sets the authorization logic for socket connections.
 * @deprecated
 */
export default function install(io, ioCache) {
  // @ts-ignore
  io.set('authorization', function (socket, callback) {
    // Get User IP
    const ip = userIp(socket.handshake);

    // Check if the IP is blocked
    if (!Array.isArray(ioCache.blocklick) || ioCache.blocklick.indexOf(ip) < 0) {
      // Allow the socket to connect
      callback(null, true);
    } else {
      // Prevent the socket handshake with an error
      callback('socket.io is not accepting connections from this page', false);
    }
  });
}

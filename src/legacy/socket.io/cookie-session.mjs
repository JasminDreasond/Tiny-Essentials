/**
 * Handles the cookie session for a socket connection by simulating an Express request and response.
 * This function uses the provided session module to manage session data for the socket connection.
 *
 * @param {Record<string, any>} socket - The socket object representing the connection.
 * @param {Function} sessionModule - The session module function, typically used with Express, that handles session logic.
 * @returns {Promise<Record<string, any>>} A promise that resolves with the session object once the session is processed.
 * @deprecated
 */
export default function cookieSession(socket, sessionModule) {
  return new Promise((resolve) => {
    // Express Simulator
    /** @type {Record<*,*>} */
    let req = {
      connection: { encrypted: false },
      headers: { cookie: socket.request.headers.cookie },
    };
    let res = { getHeader: () => {}, setHeader: () => {} };

    // Session
    return sessionModule(req, res, async () => resolve(req.session));
  });
}

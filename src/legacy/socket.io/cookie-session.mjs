export default function cookieSession(socket, sessionModule) {
  return new Promise((resolve) => {
    // Express Simulator
    let req = {
      connection: { encrypted: false },
      headers: { cookie: socket.request.headers.cookie },
    };
    let res = { getHeader: () => {}, setHeader: () => {} };

    // Session
    return sessionModule(req, res, async () => {
      // Return Session
      resolve(req.session);

      // Complete
      return;
    });
  });
}

// @ts-nocheck

import objType from '../../../get/objType.mjs';

/**
 * Retrieves a session value from the request's session object based on the provided key.
 * If the session object and the specific session key exist and are of the expected type,
 * the value is returned. Otherwise, `null` is returned.
 *
 * @function
 * @param {Record<string, any>} req - The request object, which contains the session data.
 * @param {string} where - The key for which the session value is being retrieved.
 *
 * @returns {string|null} The session value associated with the provided key, or `null` if it doesn't exist or isn't valid.
 *
 * @example
 * const userToken = cookieSession(req, 'authToken');
 * if (userToken) {
 *   console.log('Session token:', userToken);
 * } else {
 *   console.log('No valid token in session');
 * }
 */
export default function cookieSession(req, where) {
  // Get Token
  if (objType(req.session, 'object') && typeof req.session[where] === 'string')
    return req.session[where];
  // Nope
  else return null;
}

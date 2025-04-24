// @ts-nocheck

/**
 * Generates a Base64-encoded string for HTTP Basic Authentication using the provided `client_id` and `client_secret`.
 * The string is formatted as `client_id:client_secret`, then encoded in Base64 for use in Authorization headers.
 *
 * @function
 * @param {Object} tinyAuth - The object containing authentication credentials.
 * @param {string} tinyAuth.client_id - The client ID for the authentication process.
 * @param {string} tinyAuth.client_secret - The client secret associated with the client ID.
 *
 * @returns {string} The Base64-encoded string in the format `client_id:client_secret`.
 *
 * @example
 * const authHeader = credentials({ client_id: 'myClientId', client_secret: 'mySecret' });
 * console.log(authHeader);  // Outputs: 'bXlDbGllZW50SWQ6bXlTZWNyZXQ='
 */
export default function credentials(tinyAuth) {
  // Result
  const result = Buffer.from(`${tinyAuth.client_id}:${tinyAuth.client_secret}`).toString('base64');
  return result;
}

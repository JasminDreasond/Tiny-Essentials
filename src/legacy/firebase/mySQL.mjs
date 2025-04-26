// @ts-nocheck

import mysqlConnector from './mysqlConnector/index.mjs';

/**
 * Connects to a MySQL database using the provided configuration and credentials.
 * The function utilizes `mySqlConnector.create` to establish the connection.
 *
 * @param {Record<string, any>} mysql - The MySQL module instance.
 * @param {Array|string} databases - The list of databases to connect to, or a single database name.
 * @param {Record<string, any>} cfg - The configuration object containing connection details (e.g., host, user, password).
 * @returns {Promise} Resolves with the connection object or rejects with an error.
 */
export default function mySQL(mysql, databases, cfg) {
  return new Promise(function (resolve, reject) {
    // Get Module
    try {
      mySqlConnector.create(mysql, databases, cfg, 'firebase').then(resolve).catch(reject);
    } catch (err) {
      // Error
      reject(err);
    }
  });
}

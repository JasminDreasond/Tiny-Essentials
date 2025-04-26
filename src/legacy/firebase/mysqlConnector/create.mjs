// @ts-nocheck

/**
 * Initializes and caches one or more MySQL database connections using provided configuration.
 * Supports Firebase and Google Cloud SQL socket-based connections, as well as local/standard MySQL setups.
 *
 * @async
 * @param {Record<string, any>} mysql - The `mysql2` module or similar instance, with a `.createPool()` method.
 * @param {string} proxyType - The type of proxy connection. Can be `"default"`, `"firebase"`, or `"google_cloud"`.
 * @param {Record<string, any>|Record<string, any>[]} databases - A single database config object or an array of config objects.
 * @param {Record<string, any>} cfg - Global fallback configuration, e.g., `{ charset: 'utf8mb4' }`.
 *
 * @returns {Promise<Record<string, any>>} Resolves with a single connection object if one database is provided,
 *                            or a map of database names to connections if multiple databases are configured.
 *
 * @throws {Error} Will reject if any database config is invalid or if the proxyType is unsupported.
 *
 * @example
 * const connection = await create(mysql, 'default', {
 *   data: { database: 'my_db', user: 'root', password: 'pass', host: 'localhost', port: 3306 },
 *   default: { host: 'localhost', port: 3306 },
 * });
 *
 * @example
 * const connections = await create(mysql, 'google_cloud', [
 *   {
 *     data: { database: 'db1', user: 'user', password: 'pass' },
 *     google_cloud: { socketPath: '/cloudsql/project:region:instance' },
 *     default: { host: 'localhost', port: 3306 },
 *   },
 *   {
 *     data: { database: 'db2', user: 'user', password: 'pass' },
 *     google_cloud: { socketPath: '/cloudsql/project:region:instance2' },
 *     default: { host: 'localhost', port: 3306 },
 *   }
 * ]);
 */
export default function create(mysql, proxyType, databases, cfg) {
  return new Promise(function (resolve, reject) {
    let databaseList = [];

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, cfg, {
      charset: 'utf8mb4',
    });

    // Convert
    if (!Array.isArray(databases)) databaseList = [clone(databases)];
    else databaseList = clone(databases);

    // Run Array
    for (const item in databaseList) {
      // Exist
      if (objType(databaseList[item], 'object') && objType(databaseList[item].data, 'object')) {
        if (!db[databaseList[item].data.database]) {
          // Charset
          if (typeof databaseList[item].data.charset !== 'string')
            databaseList[item].data.charset = tinyCfg.charset;

          // Firebase Is Emulator
          let firebaseIsEmulator = false;
          if (proxyType === 'firebase') {
            try {
              firebaseIsEmulator = isEmulator();
            } catch (err) {
              firebaseIsEmulator = false;
            }
          }

          // Exist Proxy
          if (!firebaseIsEmulator && typeof proxyType === 'string' && proxyType !== 'default') {
            // Google Cloud
            if (
              (proxyType === 'firebase' || proxyType === 'google_cloud') &&
              objType(databaseList[item].google_cloud, 'object') &&
              typeof databaseList[item].google_cloud.socketPath === 'string'
            ) {
              // Insert the config
              databaseList[item].data.socketPath = databaseList[item].google_cloud.socketPath;
            } else reject(new Error('Invalid Proxy Type! Index:' + item));
          }

          // Normal Connection
          else {
            // SSL Files
            if (objType(databaseList[item].default.ssl, 'object'))
              databaseList[item].data.ssl = databaseList[item].default.ssl;

            // Host and Port
            databaseList[item].data.host = databaseList[item].default.host;
            databaseList[item].data.port = databaseList[item].default.port;
          }

          // Create DB Connection
          try {
            db[databaseList[item].data.database] = mysql.createPool(databaseList[item].data);
            db[databaseList[item].data.database].query = util.promisify(
              db[databaseList[item].data.database].query,
            );
          } catch (err) {
            reject(err);
          }
        }
      }

      // Nope
      else reject(new Error('Invalid MySQL Setting! Index:' + item));
    }

    // Fix
    const dbKets = Object.keys(databaseList);

    // Complete
    if (dbKets.length < 2) resolve(db[databaseList[0].data.database]);
    else resolve(db);
  });
}

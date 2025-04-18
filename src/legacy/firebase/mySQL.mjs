import mySqlConnector from '@tinypudding/mysql-connector';

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

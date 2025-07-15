// Modules
import latestVersion from 'latest-version';
import { compare } from 'compare-versions';
import moment from 'moment';

/**
 * @typedef {{
 *  needUpdate: boolean; // `true` if the current version is outdated, `false` otherwise.
 *   now: string; // The current version of the package.
 *   new: string; // The latest version of the package available on npm.
 * }} VersionCheck
 */

/**
 * Checks if the package version is up-to-date by comparing it with the latest version available on npm.
 * The version check is cached and updated every hour.
 *
 * @param {Object} pkg - The package information.
 * @param {string} pkg.name - The name of the package.
 * @param {string} pkg.version - The current version of the package.
 *
 * @returns {Promise<VersionCheck>} The result object
 * @deprecated

 */
export default async function versionCheck(pkg) {
  /** @type {{ t: import('moment').Moment, v: string }} */
  const check_version = {};

  // Time Now
  const now = moment();

  // Check Version
  if (!check_version.t || now.diff(check_version.t, 'hours') > 0) {
    check_version.t = now.add(1, 'hours');
    check_version.v = await latestVersion(pkg.name);
  }

  // Allowed Show Version
  return {
    now: pkg.version,
    new: check_version.v,
    needUpdate: compare(pkg.version, check_version.v, '<'),
  };
}

// Modules
import latestVersion from 'latest-version';
import { compare } from 'compare-versions';
import moment from 'moment';

// Check Version
const check_version = {
  v: null,
  t: null,
};

/**
 * Checks if the package version is up-to-date by comparing it with the latest version available on npm.
 * The version check is cached and updated every hour.
 *
 * @param {Object} package - The package information.
 * @param {string} package.name - The name of the package.
 * @param {string} package.version - The current version of the package.
 *
 * @returns {Promise<Object>} The result object containing:
 *   - `needUpdate`: {boolean} - `true` if the current version is outdated, `false` otherwise.
 *   - `now`: {string} - The current version of the package.
 *   - `new`: {string} - The latest version of the package available on npm.
 */
export default async function versionCheck(package) {
  // Time Now
  const now = moment();

  // Check Version
  if (!check_version.t || now.diff(check_version.t, 'hours') > 0) {
    check_version.t = now.add(1, 'hours');
    check_version.v = await latestVersion(package.name);
  }

  // Insert Version
  const result = { needUpdate: compare(package.version, check_version.v, '<') };

  // Allowed Show Version
  result.now = package.version;
  result.new = check_version.v;

  // Return
  return result;
}

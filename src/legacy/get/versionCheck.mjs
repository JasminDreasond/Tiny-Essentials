// Modules
import latestVersion from 'latest-version';
import { compare } from 'compare-versions';
import moment from 'moment';

// Check Version
const check_version = {
  v: null,
  t: null,
};

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

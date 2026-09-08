/**
 * Parses semantic versioning strings.
 * Expected format: "major.minor.patch" or "major.minor.patch-tag" (e.g., "1.25.0" or "2.0.1-beta").
 * @template {string} VersionString
 */
class TinyVersion {
  /**
   * The major version number.
   * @type {number}
   */
  #major;

  /**
   * The minor version number.
   * @type {number}
   */
  #minor;

  /**
   * The patch version number.
   * @type {number}
   */
  #patch;

  /**
   * The optional pre-release tag or build metadata.
   * @type {string | null}
   */
  #tag;

  /**
   * Creates a new TinyVersion instance.
   *
   * @param {VersionString} versionString - The version string to parse.
   * @throws {TypeError} If the provided versionString is not a string.
   * @throws {Error} If the version string does not match the expected format.
   */
  constructor(versionString) {
    if (typeof versionString !== 'string') {
      throw new TypeError(
        `[TinyVersion] Expected version to be a string, received type: ${typeof versionString}`,
      );
    }

    // Regex captures: 1: major, 2: minor, 3: patch, 4: optional tag (without the hyphen)
    const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
    const match = versionString.match(versionRegex);

    if (!match) {
      throw new Error(
        `[TinyVersion] Invalid version format: "${versionString}". Expected format: "X.Y.Z" or "X.Y.Z-tag".`,
      );
    }

    this.#major = parseInt(match[1], 10);
    this.#minor = parseInt(match[2], 10);
    this.#patch = parseInt(match[3], 10);
    this.#tag = match[4] || null;
  }

  /**
   * Retrieves the major version number (incompatible API changes).
   * @returns {number}
   */
  get major() {
    return this.#major;
  }

  /**
   * Retrieves the minor version number (added functionality in a backwards-compatible manner).
   * @returns {number}
   */
  get minor() {
    return this.#minor;
  }

  /**
   * Retrieves the patch version number (backwards-compatible bug fixes).
   * @returns {number}
   */
  get patch() {
    return this.#patch;
  }

  /**
   * Retrieves the release tag, or null if it does not exist (e.g., "alpha", "rc.1").
   * @returns {string | null}
   */
  get tag() {
    return this.#tag;
  }

  /**
   * Compares this version with another version to see if it is greater.
   *
   * @template {TinyVersion<string>} VersionInstance
   * @param {VersionInstance} version - The version to compare against.
   * @returns {boolean} True if this version is greater than the provided version.
   * @throws {TypeError} If the provided version is not an instance of TinyVersion.
   */
  isGreaterThan(version) {
    if (!(version instanceof TinyVersion)) {
      throw new TypeError(
        `[TinyVersion] Comparison target must be an instance of TinyVersion. Received: ${typeof version}`,
      );
    }

    // 1. Compare Major
    if (this.#major !== version.major) {
      return this.#major > version.major;
    }

    // 2. Compare Minor
    if (this.#minor !== version.minor) {
      return this.#minor > version.minor;
    }

    // 3. Compare Patch
    if (this.#patch !== version.patch) {
      return this.#patch > version.patch;
    }

    // 4. Compare Tags (SemVer rule: version without tag > version with tag)
    if (this.#tag === null && version.tag !== null) {
      return true;
    }
    if (this.#tag !== null && version.tag === null) {
      return false;
    }
    if (this.#tag === null && version.tag === null) {
      return false; // They are equal
    }

    // Both have tags, compare them lexicographically
    return (this.#tag ?? '') > (version.tag ?? '');
  }

  /**
   * Compares this version with another version to see if they are equal.
   *
   * @template {TinyVersion<string>} VersionInstance
   * @param {VersionInstance} version - The version to compare against.
   * @returns {boolean} True if both versions are identical.
   * @throws {TypeError} If the provided version is not an instance of TinyVersion.
   */
  isEqualTo(version) {
    if (!(version instanceof TinyVersion)) {
      throw new TypeError(
        `[TinyVersion] Comparison target must be an instance of TinyVersion. Received: ${typeof version}`,
      );
    }

    return (
      this.#major === version.major &&
      this.#minor === version.minor &&
      this.#patch === version.patch &&
      this.#tag === version.tag
    );
  }

  /**
   * Compares this version with another version to see if it is less.
   *
   * @template {TinyVersion<string>} VersionInstance
   * @param {VersionInstance} version - The version to compare against.
   * @returns {boolean} True if this version is less than the provided version.
   * @throws {TypeError} If the provided version is not an instance of TinyVersion.
   */
  isLessThan(version) {
    if (!(version instanceof TinyVersion)) {
      throw new TypeError(
        `[TinyVersion] Comparison target must be an instance of TinyVersion. Received: ${typeof version}`,
      );
    }

    // A version is less than another if it is neither greater than nor equal to it.
    return !this.isGreaterThan(version) && !this.isEqualTo(version);
  }

  /**
   * Returns the string representation of the version.
   * @returns {VersionString} The reconstructed version string.
   */
  toString() {
    const baseVersion = `${this.#major}.${this.#minor}.${this.#patch}`;
    // @ts-ignore
    return this.#tag ? `${baseVersion}-${this.#tag}` : baseVersion;
  }
}

export default TinyVersion;

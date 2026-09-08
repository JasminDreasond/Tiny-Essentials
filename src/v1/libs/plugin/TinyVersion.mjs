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
        `[VersionManager] Expected version to be a string, received type: ${typeof versionString}`,
      );
    }

    // Regex captures: 1: major, 2: minor, 3: patch, 4: optional tag (without the hyphen)
    const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
    const match = versionString.match(versionRegex);

    if (!match) {
      throw new Error(
        `[VersionManager] Invalid version format: "${versionString}". Expected format: "X.Y.Z" or "X.Y.Z-tag".`,
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

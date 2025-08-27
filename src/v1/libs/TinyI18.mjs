import { readFile } from 'fs/promises';
import { join as pathJoin } from 'path';

/**
 * Supported operating modes for TinyI18.
 * - `"local"` → All translations are managed entirely in memory (browser + Node.js).
 * - `"file"` → Translations are loaded from JSON files on disk (Node.js only).
 * @typedef {"local" | "file"} ModeTypes
 */

/**
 * Dictionary of translation keys mapped to values.
 *
 * @typedef {Record<string, any>} Dict
 */

/**
 * Represents a translation entry as it appears in JSON files.
 *
 * @typedef {{
 *   $pattern: string,
 *   $fn: string,
 *   [key: string]: string
 * }} FileValue
 *
 * `$pattern` - Regex string (will be compiled into RegExp).
 *
 * `$fn` - Helper function name associated with this entry.

 * `[key]` - Additional key-value pairs for interpolation or extra metadata.
 */

/**
 * Represents a valid locale code string.
 * Example: "en", "pt-BR", "fr".
 *
 * @typedef {string} LocaleCode
 */

/**
 * Value types stored per locale:
 * - string: a direct translation with optional {named} interpolation
 * - Function: (params, helpers) => any (advanced rendering; HTML-safe if you control it)
 * - { $pattern: RegExp, value: string | { $fn: string, args?: any } | Function }
 * - { $fn: string, args?: any }  // in file mode; resolved to a registered function
 */

/**
 * Represents a single regex-based translation entry.
 *
 * @typedef {Object} PatternEntry
 * @property {RegExp} $pattern - Compiled regular expression used for matching.
 * @property {any} value - Translation value or resolver function associated with the pattern.
 * @property {any} elseValue - Translation value or resolver function associated with the pattern.
 */

/**
 * @typedef {Object} FileModeEntryJSON
 * @property {string} [$pattern] - regex as string e.g. "^user\\.(\\d+)$"
 * @property {string|Object} value - string or { $fn: string, args?: any }
 * @property {string|Object} elseValue - string or { $fn: string, args?: any }
 */

/**
 * @typedef {Object} TinyI18Options
 * @property {ModeTypes} mode
 * @property {LocaleCode} defaultLocale
 * @property {string} [basePath] - Required in file mode. Directory with <locale>.json
 * @property {Dict} [localResources] - Optional initial map { locale: dict } for local mode
 * @property {boolean} [strict=false] - If true, throws on missing keys; else returns key
 */

/**
 * @typedef {Object} ResolveOptions
 * @property {LocaleCode} [locale] - force resolve using a specific locale first
 */

/**
 * Represents statistics for a specific locale.
 *
 * @typedef {Object} StatLocale
 * @property {string} locale - The locale code (e.g., "en", "pt-BR").
 * @property {number} strings - Total number of static string entries in this locale.
 * @property {number} patterns - Total number of regex-based pattern entries in this locale.
 * @property {boolean} isDefault - Whether this locale is the default fallback.
 * @property {boolean} isCurrent - Whether this locale is currently loaded/active.
 */

/**
 * Read-only view of registered helpers, exposed to function-based entries.
 *
 * Provides safe access to:
 * - check if a helper exists by name
 * - call a helper by name, passing arguments
 *
 * @template {any} T
 * @template {any} R
 * @typedef {Object} HelpersReadonly
 * @property {(name: string) => boolean} has - Check if a helper with given name is registered.
 * @property {(name: string, arg: T, extras?: Record<string, any>) => R} call -
 * Invoke a helper by name with an argument and optional extras.
 */

/**
 * TinyI18 — Professional and flexible i18n manager with dual mode (local/file),
 * regex-based keys, and function-based entries for advanced rendering (incl. HTML).
 *
 * - Mode "local": in-memory resources (Node + Browser).
 * - Mode "file": JSON files on disk via fs/path (Node only).
 * - Keeps only default + selected locale in memory.
 * - Selected locale overrides default; fallback resolves to default.
 * - Supports string entries, regex pattern entries, and function-backed entries.
 * - Safe: no dynamic code eval from files; functions in file mode are referenced by name ("$fn").
 */
class TinyI18 {
  /** @type {ModeTypes} */
  #mode;
  /** @type {LocaleCode} */
  #defaultLocale;
  /** @type {LocaleCode|null} */
  #currentLocale = null;
  /** @type {boolean} */
  #strict;
  /** @type {string|null} */
  #basePath = null;

  /** @type {Map<LocaleCode, Dict>} */
  #stringTables = new Map(); // plain key => string | { $fn } | Function

  /** @type {Map<LocaleCode, PatternEntry[]>} */
  #patternTables = new Map(); // array of { $pattern: RegExp, value }

  // Helpers registry for function-based entries in both modes.
  /** @type {Map<string, Function>} */
  #helpers = new Map();

  /** @type {Map<string, RegExp>} */
  #regexCache = new Map();

  /**
   * Gets the currently selected locale, or null if only default is active.
   * @returns {LocaleCode|null}
   */
  get currentLocale() {
    return this.#currentLocale;
  }

  /**
   * The default locale code chosen at construction time.
   * This locale is always kept in memory as a fallback.
   * @type {LocaleCode}
   */
  get defaultLocale() {
    return this.#defaultLocale;
  }

  /**
   * The current operating mode of this instance.
   * Determines whether translations are managed in memory ("local")
   * or loaded from JSON files ("file").
   * @type {ModeTypes}
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Whether strict mode is enabled.
   * - `true` → Missing keys, invalid regex, or helper errors throw exceptions.
   * - `false` → Failures are ignored silently, returning fallback values.
   * @type {boolean}
   */
  get strict() {
    return this.#strict;
  }

  /**
   * Base directory path used in `"file"` mode to locate locale JSON files.
   * - In `"local"` mode this will always be `null`.
   * - In `"file"` mode this is the root folder passed to the constructor.
   * @type {string|null}
   */
  get basePath() {
    return this.#basePath;
  }

  /**
   * Returns basic stats for debugging/memory insights.
   * @returns {StatLocale[]}
   */
  get stats() {
    const locales = [];
    for (const loc of this.#stringTables.keys()) {
      const strings = Object.keys(this.#stringTables.get(loc) ?? {}).length;
      const patterns = this.#patternTables.get(loc)?.length ?? 0;
      locales.push({
        locale: loc,
        strings,
        patterns,
        isDefault: loc === this.#defaultLocale,
        isCurrent: loc === this.#currentLocale,
      });
    }
    return locales;
  }

  // -------------------- Internal: resolution & materialization --------------------

  /**
   * @param {string} [forceLocale]
   * @returns {string[]}
   */
  #resolveOrder(forceLocale) {
    /** @type {LocaleCode[]} */
    const order = [];
    if (forceLocale && typeof forceLocale === 'string' && this.#stringTables.has(forceLocale))
      order.push(forceLocale);
    else if (this.#currentLocale) order.push(this.#currentLocale);

    // default is always last if not skipped externally
    order.push(this.#defaultLocale);
    return order;
  }

  /**
   * @param {string[]} order
   * @param {string} key
   * @returns {any}
   */
  #resolveExact(order, key) {
    for (const loc of order) {
      const table = /** @type {Dict} */ (this.#stringTables.get(loc));
      if (table && Object.prototype.hasOwnProperty.call(table, key)) {
        return table[key];
      }
    }
    return undefined;
  }

  /**
   * @param {string[]} order
   * @param {string} key
   * @returns {any}
   */
  #resolveByPattern(order, key) {
    for (const loc of order) {
      const patterns = this.#patternTables.get(loc) || [];
      for (const entry of patterns) {
        if (entry.$pattern.test(key)) return entry.value;
        else return entry.elseValue ?? undefined;
      }
    }
    return undefined;
  }

  /**
   * Value can be:
   * - string
   * - function (params, helpers) => any
   * - { $fn: string, args?: any }   // file mode placeholder resolved via helpers
   *
   * @param {string | ((params: Dict, helpers: HelpersReadonly<any, any>) => string) | { $fn: string; args?: any }} value
   * @param {Dict} [params]
   * @returns {string}
   */
  #materialize(value, params) {
    if (typeof value === 'string') return this.#interpolate(value, params);
    if (typeof value === 'function') return value(params ?? {}, this.#helpersReadonly());

    if (value && typeof value === 'object' && typeof value.$fn === 'string') {
      const fn = this.#helpers.get(value.$fn);
      if (typeof fn !== 'function') {
        if (this.#strict) throw new Error(`TinyI18: helper "${value.$fn}" is not registered`);
        return '';
      }
      const args = value.args !== undefined ? value.args : undefined;
      return fn({ ...(params ?? {}), args }, this.#helpersReadonly());
    }
    // Unknown entry type
    if (this.#strict) throw new Error('TinyI18: unsupported entry type');
    return '';
  }

  /**
   * @param {string} template
   * @param {Dict} [params]
   * @returns {string}
   */
  #interpolate(template, params) {
    if (!params || typeof params !== 'object') return template;
    // Simple {name} interpolation, no ICU. Escapes are not added; caller controls HTML safety.
    return template.replace(/\{([a-zA-Z0-9_.$-]+)\}/g, (_, name) => {
      const val = this.#dotGet(params, name);
      return val === undefined || val === null ? '' : String(val);
    });
  }

  /**
   * @param {Dict} obj
   * @param {string} path
   * @returns {Dict|undefined}
   */
  #dotGet(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  /** @returns {HelpersReadonly<any, any>} */
  #helpersReadonly() {
    // Provide a minimal read-only facade for helpers to call other helpers safely if needed.
    return {
      has: (name) => this.#helpers.has(name),
      call: (name, arg, extras) => {
        const fn = this.#helpers.get(name);
        if (typeof fn !== 'function') throw new Error(`Helper "${name}" not found`);
        return fn(arg, extras ?? {});
      },
    };
  }

  // -------------------- Internal: ingesting locale data --------------------

  /**
   * @param {string} locale
   * @param {Dict} raw
   */
  #ingestLocale(locale, raw) {
    if (typeof locale !== 'string' || !locale) throw new TypeError('#ingestLocale: invalid locale');
    if (!raw || typeof raw !== 'object')
      throw new TypeError('#ingestLocale: "raw" must be an object');

    /** @type {Dict} */
    const flat = { ...(this.#stringTables.get(locale) ?? {}) };
    /** @type {PatternEntry[]} */
    const patterns = [...(this.#patternTables.get(locale) ?? [])];

    /**
     * @param {string} prefix
     * @param {Dict} node
     */
    const walk = (prefix, node) => {
      if (node == null) return;
      if (
        typeof node === 'string' ||
        typeof node === 'function' ||
        (node && typeof node === 'object' && typeof node.$fn === 'string')
      ) {
        if (!prefix) throw new TypeError('Leaf value requires a key path');
        flat[prefix] = node;
        return;
      }
      if (node && typeof node === 'object') {
        // Pattern form in local mode can be { $pattern: RegExp, value: ... }
        if (
          node.$pattern instanceof RegExp &&
          Object.prototype.hasOwnProperty.call(node, 'value')
        ) {
          patterns.push({ $pattern: node.$pattern, value: node.value, elseValue: node.elseValue });
          return;
        }
        for (const [k, v] of Object.entries(node)) {
          const path = prefix ? `${prefix}.${k}` : k;
          walk(path, v);
        }
      }
    };

    walk('', raw);

    this.#stringTables.set(locale, flat);
    this.#patternTables.set(locale, patterns);

    // Ensure default exists
    if (!this.#stringTables.has(this.#defaultLocale)) {
      this.#stringTables.set(this.#defaultLocale, {});
      this.#patternTables.set(this.#defaultLocale, []);
    }
  }

  /**
   * @param {string} locale
   */
  #unloadLocale(locale) {
    if (locale === this.#defaultLocale) return; // never unload default
    this.#stringTables.delete(locale);
    this.#patternTables.delete(locale);
  }

  // -------------------- File mode loading --------------------

  /**
   * @param {string} locale
   */
  async #loadLocaleFromFile(locale) {
    const file = pathJoin(this.#basePath ?? '', `${locale}.json`);
    let json;
    try {
      const raw = await readFile(file, 'utf8');
      json = JSON.parse(raw);
    } catch (err) {
      if (!(err instanceof Error)) return;
      if (this.#strict) throw new Error(`TinyI18: failed to load or parse ${file}: ${err.message}`);
      // register empty to avoid repeated I/O
      this.#stringTables.set(locale, {});
      this.#patternTables.set(locale, []);
      return;
    }

    /**
     * Convert JSON to internal form: flatten + compile patterns + keep $fn placeholders
     * @type {Dict}
     */
    const flat = { ...(this.#stringTables.get(locale) ?? {}) };
    /** @type {PatternEntry[]} */
    const patterns = [...(this.#patternTables.get(locale) ?? [])];

    /**
     * @param {string} prefix
     * @param {FileValue|string|null} node
     */
    const walk = (prefix, node) => {
      if (node == null) return;

      // { "$pattern": "regex", "value": ... }
      if (
        node &&
        typeof node === 'object' &&
        typeof node.$pattern === 'string' &&
        Object.prototype.hasOwnProperty.call(node, 'value')
      ) {
        const regex = this.#safeRegExp(node.$pattern);
        patterns.push({
          $pattern: regex,
          value: this.#coerceFileValue(node.value),
          elseValue: this.#coerceFileValue(node.elseValue),
        });
        return;
      }

      // Leaf as string or $fn reference
      if (
        typeof node === 'string' ||
        (node && typeof node === 'object' && typeof node.$fn === 'string')
      ) {
        if (!prefix) throw new TypeError('Leaf value requires a key path');
        flat[prefix] = this.#coerceFileValue(node);
        return;
      }

      // Nested object
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          const path = prefix ? `${prefix}.${k}` : k;
          walk(path, v);
        }
      }
    };

    walk('', json);

    this.#stringTables.set(locale, flat);
    this.#patternTables.set(locale, patterns);
  }

  /**
   * @param {string} src
   * @returns {RegExp}
   */
  #safeRegExp(src) {
    const tinyReg = this.#regexCache.get(src);
    if (tinyReg) return tinyReg;
    // Basic safety wrapper; no flags support in JSON to keep it simple and deterministic.
    try {
      const re = new RegExp(src);
      this.#regexCache.set(src, re);
      return re;
    } catch {
      if (this.#strict) throw new Error(`TinyI18: invalid regex "${src}" in file`);
      return /^$/; // never matches
    }
  }

  /**
   * @param {string | FileValue} v
   * @returns {string | { $fn: string, args: string }}
   */
  #coerceFileValue(v) {
    // Strings pass through; objects with $fn kept as-is; everything else ignored gracefully
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && typeof v.$fn === 'string') {
      // ensure only serializable args pass through
      return { $fn: String(v.$fn), args: v.args };
    }
    if (this.#strict) throw new Error('TinyI18: unsupported value in file JSON');
    return '';
  }

  // -------------------- External: constructor stuff --------------------

  /**
   * @param {TinyI18Options} options
   */
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new TypeError('TinyI18: options must be an object');
    }
    const { mode, defaultLocale, basePath, localResources, strict = false } = options;

    if (mode !== 'local' && mode !== 'file')
      throw new TypeError('TinyI18: "mode" must be "local" or "file"');
    if (typeof defaultLocale !== 'string' || !defaultLocale)
      throw new TypeError('TinyI18: "defaultLocale" must be a non-empty string');
    if (typeof strict !== 'boolean') throw new TypeError('TinyI18: "strict" must be a boolean');

    if (mode === 'file') {
      if (typeof basePath !== 'string' || !basePath)
        throw new TypeError('TinyI18: "basePath" is required in file mode');
      this.#basePath = basePath;
    }

    this.#mode = mode;
    this.#defaultLocale = defaultLocale;
    this.#strict = strict;

    if (mode === 'local' && localResources && typeof localResources === 'object') {
      for (const [loc, data] of Object.entries(localResources)) {
        this.#ingestLocale(loc, data);
      }
    }

    // Ensure default locale is present (empty if not provided yet).
    if (!this.#stringTables.has(this.#defaultLocale)) {
      this.#stringTables.set(this.#defaultLocale, {});
      this.#patternTables.set(this.#defaultLocale, []);
    }

    // Selected locale starts null; user may call setLocale() after constructor.
  }

  /**
   * Clears the internal regex cache.
   *
   * The regex cache stores compiled {@link RegExp} objects to avoid
   * recompiling frequently used patterns. This wrapper ensures cache
   * management is always controlled via the API instead of direct access.
   */
  clearRegexCache() {
    this.#regexCache.clear();
  }

  /**
   * Registers a helper function available to function-based entries and $fn references.
   * @param {string} name
   * @param {Function} fn
   */
  registerHelper(name, fn) {
    if (typeof name !== 'string' || !name)
      throw new TypeError('registerHelper: "name" must be non-empty string');
    if (typeof fn !== 'function') throw new TypeError('registerHelper: "fn" must be a function');
    this.#helpers.set(name, fn);
  }

  /**
   * Unregisters a previously registered helper function.
   *
   * If the helper does not exist, this method silently does nothing.
   *
   * @param {string} name - The name of the helper to remove.
   * @returns {boolean} `true` if the helper was removed, `false` if it was not found.
   */
  unregisterHelper(name) {
    if (typeof name !== 'string' || !name)
      throw new TypeError('unregisterHelper: "name" must be non-empty string');
    return this.#helpers.delete(name);
  }

  /**
   * Loads or updates a locale data in-memory (local mode only).
   * @param {LocaleCode} locale
   * @param {Dict} data
   */
  loadLocaleLocal(locale, data) {
    if (this.#mode !== 'local')
      throw new TypeError('loadLocaleLocal is only available in "local" mode');
    this.#ingestLocale(locale, data);
  }

  /**
   * Sets the current selected locale. In file mode, loads it from disk.
   * Keeps only the default and the selected locale in memory (unloads previous selected).
   * @param {LocaleCode|null} locale - null -> keep only default
   */
  async setLocale(locale) {
    if (locale !== null && (typeof locale !== 'string' || !locale))
      throw new TypeError('setLocale: "locale" must be string or null');

    const prev = this.#currentLocale;
    if (locale === null) {
      // Unload previous selected; keep only default
      if (this.#mode === 'file' && prev && prev !== this.#defaultLocale) this.#unloadLocale(prev);

      this.#currentLocale = null;
      return;
    }

    if (locale === this.#defaultLocale) {
      // If switching to default, unload previous selected
      if (this.#mode === 'file' && prev && prev !== this.#defaultLocale) this.#unloadLocale(prev);
      this.#currentLocale = this.#defaultLocale;
      return;
    }

    // Load or ensure presence
    if (!this.#stringTables.has(locale)) {
      if (this.#mode === 'file') await this.#loadLocaleFromFile(locale);
      else if (!this.#stringTables.has(locale)) {
        // local mode: if not previously provided, create empty containers
        this.#stringTables.set(locale, {});
        this.#patternTables.set(locale, []);
      }
    }

    // Unload previous selected if different and not default
    if (this.#mode === 'file' && prev && prev !== this.#defaultLocale && prev !== locale)
      this.#unloadLocale(prev);

    this.#currentLocale = locale;
  }

  /**
   * Resolves a translation. Supports:
   * - String entries with {named} interpolation.
   * - Function entries (local mode or registered via "$fn" in file mode).
   * - Regex pattern entries when exact key is missing.
   *
   * @param {string} key
   * @param {Dict} [params]
   * @param {ResolveOptions} [options]
   * @returns {any} - string, HTMLElement, DocumentFragment, or anything your function returns
   */
  t(key, params = undefined, options = undefined) {
    return this.get(key, params, options);
  }

  /**
   * Alias of t()
   * @param {string} key
   * @param {Dict} [params]
   * @param {ResolveOptions} [options]
   * @returns {any}
   */
  get(key, params = undefined, options = undefined) {
    if (typeof key !== 'string' || !key)
      throw new TypeError('get: "key" must be a non-empty string');

    const { locale: forceLocale } = options || {};

    const order = this.#resolveOrder(forceLocale);
    let resolved = this.#resolveExact(order, key);
    if (resolved === undefined) {
      if (this.#strict) throw new Error(`TinyI18: missing translation for key "${key}"`);
      return key; // graceful fallback to key
    }

    return this.#materialize(resolved, params);
  }

  /**
   * @param {string} key
   * @param {ResolveOptions} [options]
   * @returns {any}
   */
  p(key, options) {
    return this.resolveByPattern(key, options);
  }

  /**
   * Alias of p()
   * @param {string} key
   * @param {ResolveOptions} [options]
   * @returns {any}
   */
  resolveByPattern(key, options) {
    const { locale: forceLocale } = options || {};
    const order = this.#resolveOrder(forceLocale);
    let resolved = this.#resolveByPattern(order, key);
    if (resolved === undefined) {
      if (this.#strict) throw new Error(`TinyI18: missing translation for key "${key}"`);
      return key; // graceful fallback to key
    }
    return resolved;
  }

  /**
   * Clears everything except the default locale (keeps its data).
   * Selected locale becomes null.
   */
  resetToDefaultOnly() {
    if (this.#mode === 'file') {
      for (const loc of Array.from(this.#stringTables.keys())) {
        if (loc !== this.#defaultLocale) {
          this.#unloadLocale(loc);
        }
      }
    }
    this.#currentLocale = null;
  }
}

export default TinyI18;

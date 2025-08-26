import { readFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';

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
 */

/**
 * @typedef {Object} FileModeEntryJSON
 * @property {string} [$pattern] - regex as string e.g. "^user\\.(\\d+)$"
 * @property {string|Object} value - string or { $fn: string, args?: any }
 */

/**
 * @typedef {Object} TinyI18Options
 * @property {"local"|"file"} mode
 * @property {LocaleCode} defaultLocale
 * @property {string} [basePath] - Required in file mode. Directory with <locale>.json
 * @property {Dict} [localResources] - Optional initial map { locale: dict } for local mode
 * @property {boolean} [strict] - If true, throws on missing keys; else returns key
 */

/**
 * @typedef {Object} ResolveOptions
 * @property {LocaleCode} [locale] - force resolve using a specific locale first
 * @property {boolean} [skipFallback] - if true, do not fallback to default
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
 * Represents overall statistics for the TinyI18 instance.
 *
 * @typedef {Object} Stats
 * @property {"local"|"file"} mode - Current storage mode being used ("local" = in-memory, "file" = filesystem).
 * @property {string} defaultLocale - The locale code configured as default.
 * @property {string|null} currentLocale - The locale code currently active, or null if none selected.
 * @property {StatLocale[]} locales - Detailed stats for all tracked locales.
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
  /** @type {"local"|"file"} */
  #mode;
  /** @type {LocaleCode} */
  #defaultLocale;
  /** @type {LocaleCode|null} */
  #currentLocale = null;
  /** @type {Map<LocaleCode, Dict>} */
  #stringTables = new Map(); // plain key => string | { $fn } | Function
  /** @type {Map<LocaleCode, PatternEntry[]>} */
  #patternTables = new Map(); // array of { $pattern: RegExp, value }
  /** @type {boolean} */
  #strict;
  /** @type {string|null} */
  #basePath = null;

  // Helpers registry for function-based entries in both modes.
  /** @type {Map<string, Function>} */
  #helpers = new Map();

  /**
   * Gets the currently selected locale, or null if only default is active.
   * @returns {LocaleCode|null}
   */
  get currentLocale() {
    return this.#currentLocale;
  }

  /**
   * @returns {LocaleCode}
   */
  get defaultLocale() {
    return this.#defaultLocale;
  }

  // -------------------- Internal: resolution & materialization --------------------

  /**
   * @param {string} [forceLocale]
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
        if (entry.$pattern.test(key)) {
          return entry.value;
        }
      }
    }
    return undefined;
  }

  /**
   * @param {string|((params: Dict, helpers: HelpersReadonly<any, any>) => any)|{ $fn: string; args: any; }} value
   * @param {Dict} [params]
   * @returns {string}
   */
  #materialize(value, params) {
    // Value can be:
    // - string
    // - function (params, helpers) => any
    // - { $fn: string, args?: any }   // file mode placeholder resolved via helpers
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

    const flat = Object.create(null);
    /** @type {PatternEntry[]} */
    const patterns = [];

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
          patterns.push({ $pattern: node.$pattern, value: node.value });
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
      this.#stringTables.set(this.#defaultLocale, Object.create(null));
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
      this.#stringTables.set(locale, Object.create(null));
      this.#patternTables.set(locale, []);
      return;
    }

    // Convert JSON to internal form: flatten + compile patterns + keep $fn placeholders
    const flat = Object.create(null);
    /** @type {PatternEntry[]} */
    const patterns = [];

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
        patterns.push({ $pattern: regex, value: this.#coerceFileValue(node.value) });
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

  /** @param {string} src */
  #safeRegExp(src) {
    // Basic safety wrapper; no flags support in JSON to keep it simple and deterministic.
    try {
      return new RegExp(src);
    } catch {
      if (this.#strict) throw new Error(`TinyI18: invalid regex "${src}" in file`);
      return /^$/; // never matches
    }
  }

  /**
   * @param {string | FileValue} v
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
      this.#stringTables.set(this.#defaultLocale, Object.create(null));
      this.#patternTables.set(this.#defaultLocale, []);
    }

    // Selected locale starts null; user may call setLocale() after constructor.
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
      if (prev && prev !== this.#defaultLocale) this.#unloadLocale(prev);

      this.#currentLocale = null;
      return;
    }

    if (locale === this.#defaultLocale) {
      // If switching to default, unload previous selected
      if (prev && prev !== this.#defaultLocale) this.#unloadLocale(prev);
      this.#currentLocale = this.#defaultLocale;
      return;
    }

    // Load or ensure presence
    if (!this.#stringTables.has(locale)) {
      if (this.#mode === 'file') await this.#loadLocaleFromFile(locale);
      else {
        // local mode: if not previously provided, create empty containers
        this.#stringTables.set(locale, Object.create(null));
        this.#patternTables.set(locale, []);
      }
    }

    // Unload previous selected if different and not default
    if (prev && prev !== this.#defaultLocale && prev !== locale) this.#unloadLocale(prev);

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

    const { locale: forceLocale, skipFallback = false } = options || {};

    const order = this.#resolveOrder(forceLocale);
    let resolved = this.#resolveExact(order, key);

    if (resolved === undefined) resolved = this.#resolveByPattern(order, key);
    if (resolved === undefined) {
      if (this.#strict) {
        throw new Error(`TinyI18: missing translation for key "${key}"`);
      }
      return key; // graceful fallback to key
    }

    return this.#materialize(resolved, params);
  }

  /**
   * Returns basic stats for debugging/memory insights.
   * @returns {Stats}
   */
  stats() {
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
    return {
      mode: this.#mode,
      defaultLocale: this.#defaultLocale,
      currentLocale: this.#currentLocale,
      locales,
    };
  }

  /**
   * Clears everything except the default locale (keeps its data).
   * Selected locale becomes null.
   */
  resetToDefaultOnly() {
    for (const loc of Array.from(this.#stringTables.keys())) {
      if (loc !== this.#defaultLocale) {
        this.#unloadLocale(loc);
      }
    }
    this.#currentLocale = null;
  }
}

export default TinyI18;

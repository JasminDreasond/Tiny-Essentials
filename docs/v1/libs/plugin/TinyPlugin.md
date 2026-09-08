# 🛠️ TINY PLUGIN SYSTEM: ARCHITECTURAL SPECIFICATION & DEVELOPER PROMPT

> **IMPORTANT:** This document serves as the authoritative source of truth for the Tiny Plugin System. All developers (human and AI) must adhere to these architectural constraints to ensure system integrity and type safety.

---

## 🎯 SYSTEM OVERVIEW
The Tiny Plugin System is a highly structured, type-safe framework designed for managing plugin lifecycles. It operates on a **"Double-Layer Validation"** principle:
1.  **Static Layer:** Using advanced JSDoc Generics to provide IDE-level type safety.
2.  **Runtime Layer:** Using strict manual validation within plugin installers to prevent invalid states.

---

## 🛡️ THE GOLDEN RULES (CRITICAL CONSTRAINTS)

### 🚫 RULE 01: NO MUTATION (Architectural Integrity)
**NEVER** attempt to manually inject, add, or modify properties or methods directly onto the `instance` (`TinyPlugin`) or the `engine` (`TinyPluginCore`) inside an installer function. 
- **Incorrect:** `instance.myNewMethod = () => {};`
- **Correct:** Use the **Extension Pattern** (see Section 3).

### 🛡️ RULE 02: THE EXTENSION PATTERN (@extended)
If a plugin requires custom methods or properties on the engine, you **MUST** use inheritance.
1.  Create a new class that `extends TinyPluginCore`.
2.  Define your custom logic within this subclass.
3.  Use this subclass as the `Engine` type reference in your plugin's JSDoc.
**Rule:** *Expand the core via inheritance BEFORE implementing the plugin logic.*

### 🛡️ RULE 03: MANDATORY RUNTIME VALIDATION
Every plugin installer **MUST** perform a deep validation of its `options` object.
- Use `throw new TypeError(...)` for every property defined in your `@typedef`.
- A plugin must fail fast during the `installPlugin` phase if its configuration is invalid.

---

## 🚀 WORKFLOW & IMPLEMENTATION GUIDE

### 1. HOST SETUP (The Engine)
The host application must extend `TinyPluginCore` to gain registry capabilities.

```javascript
// Example: `./MyEngine.mjs`
import { TinyPluginCore, TinyPlugin } from 'tiny-essentials/libs/plugin/TinyPlugin';

/**
 * A function used to install a plugin into the engine.
 * @template {string} IdString
 * @template {string} VersionString
 * @template {any[]} Options
 * @typedef {import('tiny-essentials/libs/plugin/TinyPlugin').TinyPluginInstaller<MyEngine, IdString, VersionString, Options>} MyEngineInstaller
 */

/**
 * Represents a plugin instance designed to be integrated into a MyEngine.
 * @template {string} IdString
 * @template {string} VersionString
 * @template {any[]} Options
 * @typedef {TinyPlugin<MyEngine, IdString, VersionString, Options>} MyEnginePlugin
 */

class MyEngine extends TinyPluginCore {
  /**
   * Initializes a new instance of the MyEngine with the provided configuration and logger settings.
   * @param {Object} [lgConfig] - Configuration options for the instance.
   * @param {boolean} [lgConfig.debugMode=false] - Whether to enable internal debug logging.
   * @param {boolean} [lgConfig.useLogColors=false] - Whether to enable log color support.
   * @param {Partial<Console>} [lgConfig.logger=console] - A custom logger object..
   */
  constructor(config = {}, lgConfig = {}) {
    super({
      id: '[_blue_My-Engine_reset_]',
      logger: lgConfig.logger ?? console,
      debugMode: lgConfig.debugMode ?? false,
      useLogColors: lgConfig.useLogColors ?? false,
    });
  }

  // Add custom engine-level methods here
  customMethod() { console.log("Engine logic"); }
}

export default MyEngine;
```

### 2. PLUGIN CREATION (The Guest)
Plugins must be isolated files exporting an installer function.

**Required Pattern:**
1.  **Define Options:** Use `@typedef {Object}` for the plugin's configuration options and define every property and its type explicitly.
2.  **Annotate Installer:** Use the generic `Installer` type from the specific Engine to annotate the function. This allows the IDE to validate the `options` object when you call `installPlugin`.
3.  **Implement Validation:** Throw `TypeError` for all options.

**⚠️ TECHNICAL NUANCE:** The plugin file exports an **Installer Function**. 
- The installer function is a **setup routine** that returns `void`.
- Its purpose is to receive the `instance` and configure it.
- It **MUST NOT** return the plugin instance itself.

```javascript
// Example: `./plugins/MyPlugin.mjs`
/**
 * @typedef {Object} MyPluginOptions
 * @property {string} apiKey - The API key for the service.
 * @property {boolean} [debug=false] - Enable debug mode.
 */

/**
 * @type {import('../MyEngine.mjs').MyEngineInstaller<'MyPluginId', '1.0.0', [MyPluginOptions]>}
 */
const MyPluginInstaller = (instance, options) => {
  // 1. Runtime Validation (CRITICAL)
  if (typeof options.apiKey !== 'string') throw new TypeError('apiKey must be a string');
  if (typeof options.debug !== 'boolean') throw new TypeError('debug must be a boolean');

  // 2. Implementation (Configuring the 'instance')
  if (options.debug) {
    console.log(`Plugin ${instance.id} initialized with key: ${options.apiKey}`);
  }
  // Note: This function returns nothing (void).
};

export default MyPluginInstaller;
```

### 3. INTEGRATION & INITIALIZATION
The engine performs the actual instantiation.

```javascript
import MyEngine from './MyEngine.mjs';
import MyPluginInstaller from './plugins/MyPlugin.mjs';

// Instantiate the Engine
const engine = new MyEngine();

// THE ENGINE'S ROLE:
// 1. It takes the installer (void function).
// 2. It creates the TinyPlugin instance.
// 3. It returns the instance to the developer.
const pluginInstance = engine.installPlugin(MyPluginInstaller, { 
  apiKey: 'abc-123', 
  debug: true 
});

console.log('Plugin Status:', pluginInstance.isReady); // pluginInstance is the TinyPlugin object.
```

---

## 🤖 AI AGENT INSTRUCTIONS (PROMPT)
When assisting with this codebase:
1.  **Distinguish between Installer and Instance:** Always clarify that the `Installer` function is a `void` setup routine, while `engine.installPlugin()` is the method that returns the `TinyPlugin` instance.
2.  **Always check the `@typedef`** of the options before suggesting implementation.
3.  **Enforce the use of Generics** in any new plugin or engine extension to maintain IDE type-safety.
4.  **If the user attempts to modify an object property directly** (e.g., `engine.newProp = ...`), immediately flag it as a violation of **RULE 01** and suggest the **Extension Pattern**.
5.  **Ensure all `throw` statements** in installers are specific (e.g., `TypeError`, `RangeError`) and provide descriptive error messages.

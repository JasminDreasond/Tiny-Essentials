import objType from '../get/objType.mjs';

/**
 * A custom module manager to validate and run hooks on external modules dynamically.
 * Especially useful for plugin-like systems or hooks in systems like payment handlers.
 * @namespace custom_module_manager
 */
const custom_module_manager = {
  /**
   * Validates if the given object has valid custom or default module arrays.
   * @param {Record<string, any>} custom_modules - The object containing module definitions.
   * @param {string} type - The specific type of module to validate.
   * @returns {boolean} Whether the module is valid.
   * @deprecated
   *
   * @example
   * custom_module_manager.validator(myModules, 'paypal'); // true or false
   */
  validator: function (custom_modules, type) {
    if (
      custom_modules &&
      custom_modules[type] &&
      (Array.isArray(custom_modules[type].custom) || Array.isArray(custom_modules[type].default))
    )
      return true;
    else return false;
  },

  /**
   * Executes all functions inside the given modules.
   * Accepts either an array of functions or an object with typed module arrays.
   *
   * @param {Record<string, function>|function[]} custom_modules - The modules or functions to run.
   * @param {*} db_prepare - A value to pass to each module when called.
   * @param {string} hookType - A string representing the hook (e.g., 'before', 'after').
   * @param {Record<string, any>} [options] - Optional. Object with keys matching types in `custom_modules`.
   *
   * @returns {Promise<void>}
   * @deprecated
   *
   * @example
   * await custom_module_manager.run(customModules, db, 'after', { paypal: true });
   */
  run: async function (custom_modules, db_prepare, hookType, options) {
    /**
     * @async
     * @param {string} [type]
     */
    const run_custom_module = async function (type) {
      let module_list = null;

      if (typeof type === 'string') {
        // @ts-ignore
        if (custom_modules && typeof custom_modules[type] === 'function')
          // @ts-ignore
          module_list = custom_modules[type];
      } else module_list = custom_modules;

      if (Array.isArray(module_list)) {
        for (const item in module_list) {
          if (typeof module_list[item] === 'function') {
            try {
              await module_list[item](db_prepare, hookType);
            } catch (err) {
              console.error(err);
            }
          } else {
            const err = new Error(
              `The Custom Paypal Module value needs to be a Function!\nArray: ${type}\nIndex: ${item}`,
            );
            console.error(err);
            console.error(err.message);
          }
        }
      }
    };

    if (objType(options, 'object')) {
      for (const item in options) {
        // @ts-ignore
        if (options[item] && Array.isArray(custom_modules[item])) await run_custom_module(item);
      }
    } else {
      if (Array.isArray(custom_modules)) await run_custom_module();
    }
  },
};

export default custom_module_manager;

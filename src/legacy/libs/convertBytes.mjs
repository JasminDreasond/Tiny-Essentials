/**
 * A utility module to convert between bytes and higher order units (KB, MB, GB, etc).
 */

/**
 * @typedef {'kb'|'mb'|'gb'|'tb'|'pb'|'eb'} SizeUnit
 */
const convertList = {
  kb: 1024,
  mb: 1048576,
  gb: 1073741824,
  tb: 1099511627776,
  pb: 1125899906842624,
  eb: 1152921504606847000,
};

const sequence = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb'];

/**
 * @namespace convertBytes
 */
const convertBytes = {
  /**
   * Conversion factors for each unit.
   * @type {Object.<SizeUnit, number>}
   */
  list: convertList,

  /**
   * Ordered list of size units.
   * @type {string[]}
   */
  sequence: sequence,

  /**
   * Converts a size in the specified unit to bytes.
   * @param {number} bytes - The number of units to convert.
   * @param {SizeUnit} selected - The unit of the input value.
   * @returns {number} The equivalent size in bytes.
   * @deprecated
   *
   * @example
   * convertBytes.get(5, 'mb'); // 5242880
   */
  get: function (bytes, selected) {
    return convertList[selected] * bytes;
  },

  /**
   * Converts a size in bytes to the specified unit.
   * @param {number} bytes - The size in bytes.
   * @param {SizeUnit} selected - The target unit.
   * @returns {number} The equivalent size in the selected unit.
   * @deprecated
   *
   * @example
   * convertBytes.convert(1048576, 'mb'); // 1
   */
  convert: function (bytes, selected) {
    return bytes / convertList[selected];
  },
};

export default convertBytes;

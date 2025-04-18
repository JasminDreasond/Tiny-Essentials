// Convert List
const convertList = {
  kb: 1024,
  mb: 1048576,
  gb: 1073741824,
  tb: 1099511627776,
  pb: 1125899906842624,
  eb: 1152921504606847000,
};

// Sequence
const sequence = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb'];

// Module
const convertBytes = {
  // List
  list: convertList,

  // Sequence
  sequence: sequence,

  // Get
  get: function (bytes, selected) {
    return convertList[selected] * bytes;
  },

  // Convert
  convert: function (bytes, selected) {
    return bytes / convertList[selected];
  },
};

export default convertBytes;

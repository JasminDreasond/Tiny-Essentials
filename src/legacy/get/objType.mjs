export default function objType(obj, type) {
  // Is Defined
  if (typeof obj !== 'undefined') {
    // Check Obj Type
    if (typeof type === 'string') {
      if (Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`) return true;
      else return false;
    }

    // Get Obj Type
    else {
      // Result
      const result = Object.prototype.toString.call(obj).toLowerCase();
      // Send Result
      return result.substring(8, result.length - 1);
    }
  }

  // Nope
  else return null;
}

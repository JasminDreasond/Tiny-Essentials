import firebaseEscape from './escape.mjs';

export default function databaseEscape(text, keepPath = false) {
  // is String
  if (typeof text === 'string' || typeof text === 'number') {
    // New Value
    let new_value = text;
    if (typeof new_value === 'number') new_value = String(new_value);

    // Normal
    if (!keepPath) new_value = firebaseEscape.encode(new_value);
    // Keep Path
    else {
      // Separete Path
      new_value = new_value.split('/');
      for (const item in new_value) new_value[item] = firebaseEscape.encode(new_value[item]);

      // Join Path Back
      new_value = new_value.join('/');
    }

    // Complete
    return new_value;
  }

  // Nothing
  else return null;
}

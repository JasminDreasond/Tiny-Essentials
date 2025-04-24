// @ts-nocheck

/**
 * Retrieves the value from a Firebase database snapshot.
 * This function checks if the provided data object is a valid Firebase snapshot and
 * calls its `.val()` method to get the actual data value.
 *
 * @param {firebase.database.DataSnapshot} data - The Firebase database snapshot from which to retrieve the value.
 * @returns {any} The value stored in the snapshot, or `null` if the data is invalid or doesn't contain a valid value.
 */
export default function getDBValue(data) {
  let new_data = null;
  if (data && typeof data.val === 'function') new_data = data.val();
  return new_data;
}

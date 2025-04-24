// @ts-nocheck

import clone from 'clone';
import objType from '../../get/objType.mjs';

/**
 * Creates a deep clone of a login object and attaches the given database name to it,
 * if the input types are valid.
 *
 * @param {string} database - The name of the database to associate with the user.
 * @param {Object} login - The login object that contains user data.
 * @param {Object} login.data - The nested data object inside the login object.
 * @returns {Object|null} A cloned and modified login object with the database name attached, or null if invalid input.
 */
export default function sameUser(database, login) {
  // Validator
  if (typeof database === 'string' && objType(login, 'object') && objType(login.data, 'object')) {
    // Result
    const result = clone(login);
    result.data.database = database;
    return result;
  }

  // Nope
  else return null;
}

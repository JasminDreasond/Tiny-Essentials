// @ts-nocheck

import { join } from 'path';
import { existsSync, lstatSync, readFileSync } from 'fs';

import AuthSystem from './cookieSession.mjs';
import domainRedirect from './domainRedirect.mjs';
import database from './database/index.mjs';
import * as dbEscape from './escape.mjs';
import mySQL from './mySQL.mjs';
import getDBAsync from './getDBAsync.mjs';
import getDBValue from './getDBValue.mjs';
import getDBData from './getDBData.mjs';
import transactionDBAsync from './transactionDBAsync.mjs';
import databaseEscape from './databaseEscape.mjs';
import isEmulator from './isEmulator.mjs';

/**
 * Firebase Object to handle various Firebase services and utilities.
 * Includes database, authentication, Firestore, storage, and more.
 *
 * @namespace firebaseObject
 */
const firebaseObject = { apps: {} };

/**
 * Retrieves a Firebase app by its identifier.
 *
 * @param {string|number} value - The app identifier to retrieve.
 * @returns {Object|null} The Firebase app or `null` if not found.
 */
firebaseObject.get = function (value) {
  // Check
  if ((typeof value === 'string' || typeof value === 'number') && firebaseObject.apps[value]) {
    // Send Item
    return firebaseObject.apps[value];
  }

  // Nope
  else return null;
};

/**
 * Manages cookie session for authentication.
 *
 * @type {AuthSystem}
 */
firebaseObject.cookieSession = AuthSystem;

/**
 * Manages domain redirection.
 *
 * @type {domainRedirect}
 */
firebaseObject.domainRedirect = domainRedirect;

/**
 * Handles Firebase Database interactions.
 *
 * @type {database}
 */
firebaseObject.database = database;

/**
 * Handles database escaping for safe queries.
 *
 * @type {Record<string, any>}
 */
firebaseObject.escape = dbEscape;

/**
 * Manages MySQL database interactions.
 *
 * @type {mySQL}
 */
firebaseObject.mysql = mySQL;

/**
 * Retrieves the database asynchronously.
 *
 * @type {getDBAsync}
 */
firebaseObject.getDBAsync = getDBAsync;

/**
 * Retrieves a specific database value.
 *
 * @type {getDBValue}
 */
firebaseObject.getDBValue = getDBValue;

/**
 * Retrieves database data asynchronously.
 *
 * @type {getDBData}
 */
firebaseObject.getDBData = getDBData;

/**
 * Handles asynchronous database transactions.
 *
 * @type {transactionDBAsync}
 */
firebaseObject.transactionDBAsync = transactionDBAsync;

/**
 * Provides database escape functionality for safe querying.
 *
 * @type {databaseEscape}
 */
firebaseObject.databaseEscape = databaseEscape;

/**
 * Logger to log information using Firebase or console.
 *
 * @type {Record<string, any>}
 */
firebaseObject.logger = logger;

/**
 * Checks if the Firebase environment is running in emulator mode.
 *
 * @type {isEmulator}
 */
firebaseObject.isEmulator = isEmulator;

/**
 * Starts Firebase modules based on the provided configuration.
 * Initializes services such as Database, Auth, Firestore, etc.
 *
 * @param {string} value - The Firebase app ID.
 * @param {Record<string, any>} item - Configuration for the Firebase app and services to initialize.
 * @returns {boolean} `true` if the modules were successfully started, `false` otherwise.
 */
firebaseObject.startModule = function (value, item) {
  // Check
  if ((typeof value === 'string' || typeof value === 'number') && firebaseObject.apps[value]) {
    // Confirm Action
    let action_confirmed = false;

    // Database
    if (item.database) {
      firebaseObject.apps[value].db = firebaseObject.apps[value].root.database();
      action_confirmed = true;
    }

    // Auth
    if (item.auth) {
      firebaseObject.apps[value].auth = firebaseObject.apps[value].root.auth();
      action_confirmed = true;
    }

    // Firestore
    if (item.firestore) {
      firebaseObject.apps[value].store = firebaseObject.apps[value].root.firestore();
      action_confirmed = true;
    }

    // Storage
    if (item.storage) {
      firebaseObject.apps[value].storage = firebaseObject.apps[value].root.storage();
      action_confirmed = true;
    }

    // Cloud Messaging
    if (item.messaging) {
      firebaseObject.apps[value].messaging = firebaseObject.apps[value].root.messaging();
      action_confirmed = true;
    }

    // Send positive result
    return action_confirmed;
  }

  // Nope
  else return false;
};

/**
 * Starts the Firebase app and initializes required services.
 *
 * @param {Record<string, any>} admin - The Firebase Admin SDK.
 * @param {Record<string, any>} item - Configuration containing app details and options.
 * @param {Record<string, any>} data - Additional data to initialize the app.
 * @throws {Error} Throws an error if the Firebase file is not found or if the app ID is missing.
 */
firebaseObject.start = function (admin, item, data) {
  // Try
  try {
    // Start Firebase
    const start_firebase = function (json_file = null) {
      // Check Exist
      if (!firebaseObject.apps[item.id]) {
        // Firebase Settings
        const firebase_settings = {};

        // Exist File
        if (json_file) firebase_settings.credential = admin.credential.cert(json_file);

        // Read Data
        if (data) {
          for (const data_item in data) firebase_settings[data_item] = data[data_item];
        }

        // Fix Database URL
        if (typeof firebase_settings.databaseURL === 'string') {
          if (
            !firebase_settings.databaseURL.startsWith('https://') &&
            !firebase_settings.databaseURL.endsWith('.firebaseio.com')
          )
            firebase_settings.databaseURL = `https://${firebase_settings.databaseURL}.firebaseio.com`;
        }

        // Fix Storage URL
        if (typeof firebase_settings.storageBucket === 'string')
          if (!firebase_settings.storageBucket.endsWith('.appspot.com'))
            firebase_settings.storageBucket = `${firebase_settings.storageBucket}.appspot.com`;

        // Prepare Base
        firebaseObject.apps[item.id] = {};

        // Initialize App
        firebaseObject.apps[item.id].root = admin.initializeApp(firebase_settings, item.id);

        // Auto Start
        if (item.autoStart) firebaseObject.startModule(item.id, item.autoStart);
      }
    };

    // Exist ID
    if (item && typeof item.id === 'string' && item.id !== 'start') {
      // Check Variables
      if (typeof item.appID === 'string') {
        // Key File
        let keyFile = null;
        if (item.keysFolder) keyFile = join(item.keysFolder, item.appID + '.json');

        // Exist File
        if (keyFile && existsSync(keyFile) && lstatSync(keyFile).isFile()) {
          try {
            const jsonData = readFileSync(keyFile, 'utf8');
            const parsedKey = JSON.parse(jsonData);
            start_firebase(parsedKey);
          } catch (err) {
            console.error(new Error('Failed to parse Firebase JSON file: ' + err.message));
          }
        } else console.error(new Error('Firebase File Not Found.'));
      }

      // Nope
      else start_firebase();
    }

    // Nope
    else console.error(new Error('You need to insert a ID value!'));
  } catch (err) {
    // Get Error
    console.error(err);
  }
};

// Send Module
export default firebaseObject;

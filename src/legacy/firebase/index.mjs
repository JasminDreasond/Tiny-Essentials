import path from 'path';
import fs from 'fs';

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

// Prepare Module
const firebaseObject = { apps: {} };

// Get App
firebaseObject.get = function (value) {
  // Check
  if ((typeof value === 'string' || typeof value === 'number') && firebaseObject.apps[value]) {
    // Send Item
    return firebaseObject.apps[value];
  }

  // Nope
  else return null;
};

// Cookie Session
firebaseObject.cookieSession = AuthSystem;

// Domain Redirect
firebaseObject.domainRedirect = domainRedirect;

// Database
firebaseObject.database = database;

// Encode
firebaseObject.escape = dbEscape;

// Get MySQL
firebaseObject.mysql = mySQL;

// Get Database Async
firebaseObject.getDBAsync = getDBAsync;

// Get Database Data
firebaseObject.getDBValue = getDBValue;

// Get DB Data
firebaseObject.getDBData = getDBData;

// Async Transaction
firebaseObject.transactionDBAsync = transactionDBAsync;

// Database Escape
firebaseObject.databaseEscape = databaseEscape;

// Logger
firebaseObject.logger = logger;

// Is Emulator
firebaseObject.isEmulator = isEmulator;

// Start Modules App
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

// Start
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
        if (item.keysFolder) keyFile = path.join(item.keysFolder, './' + item.appID + '.json');

        // Exist File
        if (keyFile && fs.existsSync(keyFile) && fs.lstatSync(keyFile).isFile())
          start_firebase(require(keyFile));
        // Nope
        else console.error(new Error('Firebase File Not Found.'));
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
module.exports = firebaseObject;

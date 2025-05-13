// @ts-nocheck
import moment from 'moment-timezone';
import _ from 'lodash';

/** @typedef {import("firebase/database")} FbDatabase */
/** @typedef {import("firebase/database").DataSnapshot} DataSnapshot */
/** @typedef {import("firebase/database").DatabaseReference} DatabaseReference */

/**
 * Firebase Presence System
 *
 * This module allows real-time tracking of user presence using Firebase Realtime Database.
 * It handles multiple connections (tabs/devices), updates online status, and records the last time online.
 *
 * @module presenceSystem
 */
const presenceSystem = {
  /**
   * Returns the source code of the `start` function as a string, with placeholders replaced.
   *
   * This function is useful to retrieve a browser-compatible version of the `start` function
   * for client-side injection (e.g., for Firebase emulators or test UIs).
   *
   * @param {string} [lodash='_'] - The lodash import replacement string (usually `_`).
   * @returns {string} JavaScript source code as a string with `lodash` and `moment` replaced or removed.
   */
  browserVersion: function (lodash = '_') {
    // Get Browser Version
    return presenceSystem.start
      .toString()
      .replace(`import _ from 'lodash'`, lodash)
      .replace('let moment;', '')
      .replace('moment = null;', 'console.error(err);')
      .replace(
        `import moment from 'moment-timezone'`,
        "const tinypudding = 'Tiny Jasmini's Pudding.'",
      );
  },

  /**
   * Starts presence tracking for a given user in Firebase Realtime Database.
   *
   * It sets up handlers for `.info/connected`, manages disconnect events,
   * and updates the last online time in UTC format.
   *
   * @param {object} database - Firebase database reference (usually `admin.database()` or `firebase.database()`).
   * @param {string|object} myConnectionsRef - Path or database ref to the user's `connections` node.
   * @param {string|object} lastOnlineRef - Path or database ref to the user's `lastOnline` node.
   * @param {object} [data] - Optional configuration overrides.
   * @param {boolean|object} [data.connected=true] - Data to store when device is connected.
   * @param {Function} [data.removeError] - Callback for `onDisconnect().remove()` errors.
   * @param {Function} [data.getDate] - Function to return a UTC-based timestamp object (uses `moment` if available).
   */
  start: (database, myConnectionsRef, lastOnlineRef, data) => {
    // Since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    if (typeof myConnectionsRef === 'string') {
      myConnectionsRef = database.ref(myConnectionsRef);
    }

    // stores the timestamp of my last disconnect (the last time I was seen online)
    if (typeof lastOnlineRef === 'string') {
      lastOnlineRef = database.ref(lastOnlineRef);
    }

    // Get Base
    data = _.defaultsDeep({}, data, {
      // Remove Error
      removeError: (err) => {
        if (err) {
          console.group('could not establish onDisconnect event');
          console.error(err);
          console.groupEnd();
        }
      },

      // Is Connected
      connected: true,

      // Get Data
      getDate: function () {
        // Prepare Values
        let momentTime;

        // Timezone Module
        if (moment) {
          momentTime = moment.utc().toObject();
        }

        // Vanilla
        else {
          const date = new Date();
          momentTime = {
            date: date.getUTCDate(),
            hours: date.getUTCHours(),
            milliseconds: date.getUTCMilliseconds(),
            minutes: date.getUTCMinutes(),
            months: date.getUTCMonth(),
            seconds: date.getUTCSeconds(),
            years: date.getUTCFullYear(),
          };
        }

        // Insert Timezone Name
        momentTime.timezone = 'Universal';

        // Return the value
        return momentTime;
      },
    });

    // Prepare Connection
    const connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (/** @type {DataSnapshot} */ snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        const con = myConnectionsRef.push();

        // When I disconnect, remove this device
        con.onDisconnect().remove(data.removeError);

        // Add this device to my connections list
        // this value could contain info about the device or a timestamp too
        con.set(data.connected);

        // When I disconnect, update the last time I was seen online
        const momentTime = data.getDate();
        lastOnlineRef.onDisconnect().set(momentTime);
      }
    });
  },
};

export default presenceSystem;

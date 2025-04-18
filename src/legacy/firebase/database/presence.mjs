import moment from 'moment-timezone';
import _ from 'lodash';

// Module
const presenceSystem = {
  // Get Browser Version
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

  // Start
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
    connectedRef.on('value', (snap) => {
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

import * as moment from 'moment';

export default function timeDuration(timeData = 0, durationType = 'asSeconds', now = null) {
  // Number
  if (typeof timeData !== 'undefined') {
    if (!now) now = moment();

    var duration = moment.duration(now.clone().add(timeData, 'milliseconds').diff(now.clone()));
    const result = duration[durationType]();

    // Complete
    return result;
  }

  // Nope
  else return null;
}

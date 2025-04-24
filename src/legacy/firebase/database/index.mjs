// @ts-nocheck

import presenceSystem from './presence.mjs';
import SaveAsync from './saveAsync.mjs';

const database = {
  presence: presenceSystem,
  SaveAsync,
};

export default database;

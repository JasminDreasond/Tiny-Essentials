// @ts-nocheck

import create from './create.mjs';
import nextPrev from './nextPrev.mjs';
import pagination from './pagination.mjs';
import sameUser from './sameUser.mjs';

// Modules
const mysqlConnector = {
  // Next and Prev
  nextPrev,

  // Pagination
  pagination,

  // Same User Generator
  sameUser,

  // Create DB Value
  create,
};

export default mysqlConnector;

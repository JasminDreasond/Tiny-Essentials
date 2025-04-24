// @ts-nocheck

import authURLGenerator from './authURLGenerator.mjs';
import cookieSession from './cookie-session.mjs';
import credentials from './credentials.mjs';
import errorValidator from './errorValidator.mjs';
import randomAvatar from './randomAvatar.mjs';

const getItems = {
  cookieSession,
  authURLGenerator,
  credentials,
  errorValidator,
  randomAvatar,
};

export default getItems;

// @ts-nocheck

import addGuildMember from './addGuildMember.mjs';
import getGuildWidget from './getGuildWidget.mjs';
import getToken from './getToken.mjs';
import getUser from './getUser.mjs';
import getUserConnections from './getUserConnections.mjs';
import getUserGuilds from './getUserGuilds.mjs';
import refreshToken from './refreshToken.mjs';
import revokeToken from './revokeToken.mjs';

// Module Base
const discord_api = {
  getToken,
  getUser,
  revokeToken,
  getUserGuilds,
  getGuildWidget,
  getUserConnections,
  addGuildMember,
  refreshToken,
};

export default discord_api;

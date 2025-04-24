// @ts-nocheck

import discord_api from './api/index.mjs';
import randomAvatar from './get/randomAvatar.mjs';
import login from './http/login.mjs';
import logout from './http/logout.mjs';
import redirect from './http/redirect.mjs';
import refreshToken from './http/refreshToken.mjs';

const discordAuth = {
  api: discord_api,
  randomAvatar,
  login,
  logout,
  redirect,
  refreshToken,
};

export default discordAuth;

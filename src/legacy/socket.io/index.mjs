import * as antiFlood from './antiFlood/index.mjs';
import discord from './discord.mjs';
import cookieSession from './cookie-session.mjs';

const socketIo = {
  antiFlood,
  'cookie-session': cookieSession,
  discord,
};

export default socketIo;

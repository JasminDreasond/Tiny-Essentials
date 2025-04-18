import tinyDice from '../../../libs/dice.mjs';

// Avatar Discord Generator
export default function randomAvatar(
  value = null,
  url = 'https://cdn.discordapp.com/embed/avatars/',
) {
  // Random
  if (typeof value !== 'number' && typeof value !== 'string')
    return url + tinyDice.vanilla(4) + '.png';
  // Nope
  else return url + 'https://cdn.discordapp.com/embed/avatars/' + value + '.png';
}

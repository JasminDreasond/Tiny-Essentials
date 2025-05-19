import { TinyLevelUp } from '../../dist/v1/index.mjs';

/**
 * Helper to deep clone user object to avoid mutation side-effects during testing
 */
const cloneUser = (user) => JSON.parse(JSON.stringify(user));

// ANSI colors
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const logSection = (title, emoji = '🧪') => {
  console.log(`${COLORS.bold}${COLORS.cyan}\n${emoji}  ${title}${COLORS.reset}`);
};

const logSuccess = (text) => {
  console.log(`${COLORS.green}✅ ${text}${COLORS.reset}`);
};

const logFail = (text) => {
  console.error(`${COLORS.red}❌ ${text}${COLORS.reset}`);
};

const logInfo = (text) => {
  console.log(`${COLORS.yellow}🔎 ${text}${COLORS.reset}`);
};

const logUser = (user, label = 'User') => {
  console.log(
    `${COLORS.gray}📌 ${label}: { exp: ${user.exp}, level: ${user.level}, totalExp: ${user.totalExp} }${COLORS.reset}`,
  );
};

const testLevelUp = async () => {
  const leveler = new TinyLevelUp(10, 100);

  logSection('Creating user', '👤');
  const user = leveler.createUser();
  console.assert(user.exp === 0 && user.level === 0 && user.totalExp === 0, 'createUser failed');
  logSuccess('User created with level 0 and 0 EXP');
  logUser(user);

  logSection('Validation methods', '🔍');
  console.assert(leveler.isValidUser(user) === true, 'isValidUser failed');
  leveler.validateUser(user);
  logSuccess('Validation passed for correct user');

  logSection('Invalid user objects', '🚫');
  const invalids = [
    { exp: NaN, level: 1, totalExp: 0 },
    { exp: 0, level: '1', totalExp: 0 },
    { exp: 0, level: 1, totalExp: null },
  ];

  invalids.forEach((u, i) => {
    try {
      leveler.validateUser(u);
      logFail(`Failed to throw error on invalid user ${i}`);
    } catch (_) {
      logSuccess(`Correctly caught invalid user ${i}`);
    }

    const valid = leveler.isValidUser(u);
    console.assert(valid === false, `isValidUser failed for user ${i}`);
  });

  logSection('Base experience getters', '📊');
  console.assert(leveler.getGiveExpBase() === 10, 'getGiveExpBase failed');
  console.assert(leveler.getExpLevelBase() === 100, 'getExpLevelBase failed');
  logSuccess('Base EXP and Level EXP are correct');

  logSection('Set experience manually', '🛠️');
  const setUser = cloneUser(user);
  setUser.level = 1;
  leveler.set(setUser, 120);
  logUser(setUser, 'After setting 120 EXP');
  console.assert(setUser.level === 2, 'Level should increase');
  console.assert(setUser.exp >= 0, 'Experience should reset after level-up');
  console.assert(typeof setUser.totalExp === 'number', 'totalExp must be recalculated');
  logSuccess('Set experience and leveled up successfully');

  logSection('Give experience', '🎁');
  const giveUser = leveler.createUser();
  giveUser.level = 1;
  logUser(giveUser, 'Before give()');
  const prevExp = giveUser.exp;
  leveler.give(giveUser, 50, 'add', 2);
  logUser(giveUser, 'After give(50, "add", 2)');
  console.assert(giveUser.exp !== prevExp, 'Give should change exp');
  console.assert(giveUser.totalExp >= 0, 'totalExp should be calculated');
  logSuccess('Experience given successfully');

  logSection('Remove experience', '💀');
  const removeUser = leveler.createUser();
  removeUser.level = 2;
  removeUser.exp = 30;
  logUser(removeUser, 'Before remove()');
  const oldLevel = removeUser.level;
  leveler.remove(removeUser, 100, 'extra');
  logUser(removeUser, 'After remove(100, "extra")');
  console.assert(removeUser.level <= oldLevel, 'Level should decrease if exp drops below 0');
  logSuccess('Experience removed and level adjusted correctly');

  logSection('Progress calculations', '📈');
  const progressUser = cloneUser(user);
  progressUser.level = 2;
  const progress = leveler.getProgress(progressUser);
  const progressAlt = leveler.progress(progressUser);
  console.assert(progress === 200, 'getProgress failed');
  console.assert(progressAlt === 200, 'progress failed');
  logInfo(`Progress: ${progress}`);
  logSuccess('Progress calculated correctly');

  logSection('TotalExp calculation', '📦');
  const totalUser = leveler.createUser();
  totalUser.level = 3;
  totalUser.exp = 50;
  const total = leveler.getTotalExp(totalUser);
  console.assert(total === 100 + 200 + 300 + 50, 'getTotalExp calculation failed');
  logInfo(`Total calculated EXP: ${total}`);
  logSuccess('Total experience calculated correctly');

  logSection('Experience generator randomness', '🎲');
  const xp = leveler.expGenerator(2);
  console.assert(typeof xp === 'number' && xp > 0, 'expGenerator failed');
  logSuccess(`Generated random XP: ${xp}`);

  logSection('All tests completed!', '🥳');
  logSuccess('Everything passed without errors!');
};

export default testLevelUp;

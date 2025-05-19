import { TinyRateLimiter } from '../../dist/v1/index.mjs';

/**
 * Sleep for a specified amount of time 💤
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✨ ANSI styles
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const colorText = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

const testRateLimit = async () => {
  const rateLimiter = new TinyRateLimiter({
    maxHits: 3, // 🔢 Max 3 hits
    interval: 1000, // ⏲️ 1 second window
    cleanupInterval: 500, // 🧹 Check every 0.5s
    maxIdle: 1200, // 🚫 Remove if idle for 1.2s
  });

  const userId = 'user123';
  console.log(colorText('cyan', '🚀 Starting rate limit test...'));

  // 🔁 3 quick hits — should NOT be rate limited
  for (let i = 0; i < 3; i++) {
    rateLimiter.hit(userId);
    const isLimited = rateLimiter.isRateLimited(userId);
    console.log(
      `${colorText('green', `✅ Hit ${i + 1} registered.`)} Rate limited? ❓ ` +
        (isLimited ? colorText('red', 'YES') : colorText('green', 'NO')),
    );
    await sleep(200); // ⚡ Fast 200ms between hits
  }

  // ⚠️ 4th hit — should be rate limited
  rateLimiter.hit(userId);
  const isLimited4 = rateLimiter.isRateLimited(userId);
  console.log(
    colorText('yellow', '⚠️ Hit 4 registered.') +
      ` Rate limited? 👉 ` +
      (isLimited4 ? colorText('red', 'YES') : colorText('green', 'NO')),
  );

  // ⏳ Wait for hits to expire
  console.log(colorText('blue', '⏲️ Waiting 1.5s for hits to expire...'));
  await sleep(1500);

  const afterWait = rateLimiter.isRateLimited(userId);
  console.log(
    `🔁 After wait, rate limited? ❓ ` +
      (afterWait ? colorText('red', 'YES') : colorText('green', 'NO')),
  );

  // 🧹 Wait to trigger automatic cleanup
  console.log(colorText('magenta', '🧼 Waiting 2s for auto-cleanup (inactivity)...'));
  await sleep(2000);

  const userExists = rateLimiter.userData.has(userId);
  console.log(
    `🧾 User still exists in cache? ` +
      (userExists ? colorText('green', '✅ YES') : colorText('red', '❌ NO')),
  );

  // 🛑 Destroy rate limiter
  rateLimiter.destroy();
  console.log(colorText('cyan', '🧨 Rate limiter destroyed. ✅'));
};

export default testRateLimit;

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

  // ✅ Basic configuration getters
  console.log(colorText('gray', '🔧 Config values:'));
  console.log(`- interval: ${colorText('blue', rateLimiter.getInterval() + ' ms')}`);
  console.log(`- maxHits: ${colorText('blue', rateLimiter.getMaxHits())}`);

  // 🧠 Group ID
  const groupId = rateLimiter.getGroupId(userId);
  console.log(`🔍 Group ID for ${userId}: ${colorText('green', groupId)}`);

  // 🔁 Register 3 hits
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

  // 📊 Individual metric methods
  console.log(colorText('gray', '📋 Individual metric checks:'));
  console.log(`- Total hits (group): ${rateLimiter.getTotalHits(groupId)}`);
  console.log(`- Total hits (user): ${rateLimiter.getUserHits(userId)}`);
  console.log(`- Last hit: ${rateLimiter.getLastHit(groupId)}`);
  console.log(`- Time since last hit: ${rateLimiter.getTimeSinceLastHit(groupId)} ms`);
  console.log(`- Average spacing: ${rateLimiter.getAverageHitSpacing(groupId)?.toFixed(2)} ms`);

  // 📊 getMetrics()
  const metrics = rateLimiter.getMetrics(groupId);
  console.log(colorText('gray', '📊 Full group metrics:'));
  console.log(`- Total hits: ${metrics.totalHits}`);
  console.log(`- Last hit: ${metrics.lastHit}`);
  console.log(`- Time since last hit: ${metrics.timeSinceLastHit} ms`);
  console.log(`- Avg. spacing: ${metrics.averageHitSpacing?.toFixed(2)} ms`);

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

  console.log(
    `🧾 User still exists in cache? ` +
      (rateLimiter.hasData(userId) ? colorText('green', '✅ YES') : colorText('red', '❌ NO')),
  );

    console.log(colorText('blue', '⏲️ Adding new hits...'));

  rateLimiter.hit(userId);
  rateLimiter.hit(userId);
  rateLimiter.hit(userId);

    console.log(
    `🧾 User still exists in cache? ` +
      (rateLimiter.hasData(userId) ? colorText('green', '✅ YES') : colorText('red', '❌ NO')),
  );

  // 🧽 Clear user
  console.log(colorText('magenta', '🧽 Clearing user data...'));
  rateLimiter.resetUser(userId);
  console.log(
    `- User data exists after clear? ${rateLimiter.hasData(userId) ? colorText('red', '❌ YES') : colorText('green', '✅ NO')}`,
  );

  // 🔁 Re-hit to test clearGroup
  console.log(colorText('cyan', '🔁 Re-hitting for group clear test...'));
  rateLimiter.hit(userId);
  await sleep(100);
  rateLimiter.resetGroup(groupId);
  console.log(
    `- Group data exists after clearGroup? ${rateLimiter.hasData(userId) ? colorText('red', '❌ YES') : colorText('green', '✅ NO')}`,
  );

  // 🧨 Destroy
  rateLimiter.destroy();
  console.log(colorText('cyan', '💥 Rate limiter destroyed. ✅'));
};

export default testRateLimit;

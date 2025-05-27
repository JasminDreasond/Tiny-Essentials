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

const singleTestRateLimit = async () => {
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

  console.log(
    `🧾 User still exists in cache? ` +
      (rateLimiter.hasData(userId) ? colorText('green', '✅ YES') : colorText('red', '❌ NO')),
  );

  // 🛑 Destroy rate limiter
  rateLimiter.destroy();
  console.log(colorText('cyan', '🧨 Rate limiter destroyed. ✅'));
};

const testRateLimit = async () => {
  const rateLimiter = new TinyRateLimiter({
    maxHits: 3, // 🔢 Max 3 hits
    interval: 1000, // ⏲️ 1 second window
    cleanupInterval: 500, // 🧹 Check every 0.5s
    maxIdle: 1200, // 🚫 Remove if idle for 1.2s
  });

  const userId = 'user123';
  const userId2 = 'user456';
  console.log(
    colorText('cyan', `\n🚀 Starting tests with multiple users: ${userId} and ${userId2}...\n`),
  );

  // ✅ Basic configuration getters
  console.log(colorText('gray', '🔧 Config values:'));
  console.log(`- interval: ${colorText('blue', rateLimiter.getInterval() + ' ms')}`);
  console.log(`- maxHits: ${colorText('blue', rateLimiter.getMaxHits())}`);

  // 🔁 Register 3 hits
  for (let i = 0; i < 3; i++) {
    rateLimiter.hit(userId);
    rateLimiter.hit(userId2);

    console.log(
      `${colorText('green', `✅ Hit ${i + 1} registered for ${userId}.`)} Rate limited? ` +
        (rateLimiter.isRateLimited(userId) ? colorText('red', 'YES') : colorText('green', 'NO')),
    );
    console.log(
      `${colorText('green', `✅ Hit ${i + 1} registered for ${userId2}.`)} Rate limited? ` +
        (rateLimiter.isRateLimited(userId2) ? colorText('red', 'YES') : colorText('green', 'NO')),
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

  console.log(colorText('gray', '\n📋 Metrics per user after multiple hits:'));
  console.log(`- ${userId} total hits: ${rateLimiter.getTotalHits(userId)}`);
  console.log(`- ${userId2} total hits: ${rateLimiter.getTotalHits(userId2)}`);

  // 📊 Individual metric methods
  console.log(colorText('gray', '📋 Individual metric checks:'));
  console.log(`- Total hits (userId): ${rateLimiter.getTotalHits(userId)}`);
  console.log(`- Last hit (userId): ${rateLimiter.getLastHit(userId)}`);
  console.log(`- Time since last hit (userId): ${rateLimiter.getTimeSinceLastHit(userId)} ms`);
  console.log(
    `- Average spacing (userId): ${rateLimiter.getAverageHitSpacing(userId)?.toFixed(2)} ms`,
  );

  console.log(`- Total hits (userId2): ${rateLimiter.getTotalHits(userId2)}`);
  console.log(`- Last hit (userId2): ${rateLimiter.getLastHit(userId2)}`);
  console.log(`- Time since last hit (userId2): ${rateLimiter.getTimeSinceLastHit(userId2)} ms`);
  console.log(
    `- Average spacing (userId2): ${rateLimiter.getAverageHitSpacing(userId2)?.toFixed(2)} ms`,
  );

  // 🧠 Group ID
  rateLimiter.assignToGroup(userId, 'pudding');
  rateLimiter.assignToGroup(userId2, 'pudding');
  const groupId = rateLimiter.getGroupId(userId);
  console.log(`🔍 Group ID for ${userId}: ${colorText('green', groupId)}`);

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

  const afterWait = rateLimiter.isRateLimited(groupId);
  console.log(
    `🔁 After wait, rate limited? ❓ ` +
      (afterWait ? colorText('red', 'YES') : colorText('green', 'NO')),
  );

  // 🧹 Wait to trigger automatic cleanup
  console.log(colorText('magenta', '🧼 Waiting 2s for auto-cleanup (inactivity)...'));
  await sleep(2000);

  console.log(
    `🧾 User still exists in cache? ` +
      (rateLimiter.hasData(groupId) ? colorText('red', '✅ YES') : colorText('green', '❌ NO')),
  );

  console.log(colorText('blue', '⏲️ Adding new hits...'));

  rateLimiter.hit(groupId);
  rateLimiter.hit(groupId);
  rateLimiter.hit(groupId);

  console.log(
    `🧾 User still exists in cache? ` +
      (rateLimiter.hasData(groupId) ? colorText('green', '✅ YES') : colorText('red', '❌ NO')),
  );

  // 🧽 Clear user
  console.log(colorText('magenta', '🧽 Clearing user data...'));
  rateLimiter.resetGroup(groupId);
  console.log(
    `- User data exists after clear? ${rateLimiter.hasData(groupId) ? colorText('red', '❌ YES') : colorText('green', '✅ NO')}`,
  );

  // 🔁 Re-hit to test clearGroup
  console.log(colorText('cyan', '🔁 Re-hitting for group clear test...'));
  rateLimiter.hit(groupId);
  await sleep(100);
  rateLimiter.resetGroup(groupId);
  console.log(
    `- Group data exists after clearGroup? ${rateLimiter.hasData(groupId) ? colorText('red', '❌ YES') : colorText('green', '✅ NO')}`,
  );

  console.log(
    colorText(
      'cyan',
      '🔁 Group migration test (3 new hits to pudding 1 --> moving to pudding 2)...',
    ),
  );
  const groupId2 = 'pudding2';

  rateLimiter.hit(userId);
  rateLimiter.hit(userId);
  rateLimiter.hit(userId);
  rateLimiter.assignToGroup(groupId, groupId2);
  console.log(colorText('blue', '⏲️ Adding new hit to pudding 1...'));
  rateLimiter.hit(userId);

  console.log(colorText('blue', `⏲️ Adding 2 hits to ${userId}...`));
  rateLimiter.resetUserGroup(userId);
  rateLimiter.hit(userId);
  rateLimiter.hit(userId);

  // 📊 Individual metric methods
  console.log(colorText('gray', '📋 Individual metric checks:'));
  console.log(`- Total hits (userId): ${rateLimiter.getTotalHits(userId)}`);
  console.log(`- Last hit (userId): ${rateLimiter.getLastHit(userId)}`);
  console.log(`- Time since last hit (userId): ${rateLimiter.getTimeSinceLastHit(userId)} ms`);
  console.log(
    `- Average spacing (userId): ${rateLimiter.getAverageHitSpacing(userId)?.toFixed(2)} ms`,
  );

  // 📊 getMetrics()
  const metrics2 = rateLimiter.getMetrics(groupId2);
  console.log(colorText('gray', '📊 Full pudding 2 group metrics:'));
  console.log(`- Total hits: ${metrics2.totalHits}`);
  console.log(`- Last hit: ${metrics2.lastHit}`);
  console.log(`- Time since last hit: ${metrics2.timeSinceLastHit} ms`);
  console.log(`- Avg. spacing: ${metrics2.averageHitSpacing?.toFixed(2)} ms`);

  const metrics3 = rateLimiter.getMetrics(groupId);
  console.log(colorText('gray', '📊 Full pudding group metrics:'));
  console.log(`- Total hits: ${metrics3.totalHits}`);
  console.log(`- Last hit: ${metrics3.lastHit}`);
  console.log(`- Time since last hit: ${metrics3.timeSinceLastHit} ms`);
  console.log(`- Avg. spacing: ${metrics3.averageHitSpacing?.toFixed(2)} ms`);

  // 🧨 Destroy
  rateLimiter.destroy();
  console.log(colorText('cyan', '💥 Rate limiter destroyed. ✅'));
};

const allTestRateLimit = async () => {
  await singleTestRateLimit();
  await testRateLimit();
};

export default allTestRateLimit;

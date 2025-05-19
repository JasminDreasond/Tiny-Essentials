import * as TinyEssentials from '../dist/v1/index.mjs';
import testColorSafeStringify from './libs/ColorSafeStringify.mjs';
import executeTinyPromiseQueue from './libs/TinyPromiseQueue.mjs';
import testRateLimit from './libs/TinyRateLimiter.mjs';
import executeObjType from './libs/objType.mjs';

const actions = {
  objType: executeObjType,
  promiseQueue: executeTinyPromiseQueue,
  colorStringify: testColorSafeStringify,
  rateLimit: testRateLimit,
};

(async () => {
  const arg = process.argv[2];
  // No arg? Run all
  if (!arg) for (const action of Object.values(actions)) await action();
  // Execute args
  else if (actions[arg]) await actions[arg]();
  // Fail
  else {
    console.error(`Unknown argument: ${arg}`);
    console.error(`Valid arguments are: ${Object.keys(actions).join(', ')}`);
    process.exit(1);
  }
})();

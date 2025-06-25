import * as TinyEssentials from '../dist/v1/index.mjs';
import testFolderManager from './fileManager/index.mjs';
import testColorSafeStringify from './libs/ColorSafeStringify.mjs';
import testLevelUp from './libs/TinyLevelUp.mjs';
import executeTinyPromiseQueue from './libs/TinyPromiseQueue.mjs';
import testRateLimit from './libs/TinyRateLimiter.mjs';
import executeObjType from './libs/objType.mjs';

const actions = {
  fileManager: testFolderManager,
  objType: executeObjType,
  promiseQueue: executeTinyPromiseQueue,
  colorStringify: testColorSafeStringify,
  rateLimit: testRateLimit,
  levelUp: testLevelUp,
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

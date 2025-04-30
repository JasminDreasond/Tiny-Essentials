import * as TinyEssentials from '../dist/v1/index.mjs';
import executeTinyPromiseQueue from './libs/TinyPromiseQueue.mjs';

const actions = {
  promiseQueue: executeTinyPromiseQueue,
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

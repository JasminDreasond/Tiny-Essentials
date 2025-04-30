import { TinyPromiseQueue } from '../../dist/v1/index.mjs';

const executeTinyPromiseQueue = async () => {
  await new Promise((resolve) => {
    // Create a new queue
    const queue = new TinyPromiseQueue();

    // Helper function to create simple tasks with logs
    function createTask(name, duration = 500) {
      return () =>
        new Promise((resolve) => {
          // Colored logs for task start
          console.log(`\x1b[34mStarted task: \x1b[32m${name}\x1b[0m`);

          setTimeout(() => {
            // Colored logs for task finish
            console.log(`\x1b[33mFinished task: \x1b[32m${name}\x1b[0m`);
            resolve(name);
          }, duration);
        });
    }

    // Enqueue 3 tasks
    queue.enqueue(createTask('A'), 100, 'taskA');
    queue.enqueue(createTask('B'), 0, 'taskB');
    queue.enqueue(createTask('C'), 0, 'taskC').then(() => resolve());

    // Wait for 50ms and cancel taskB
    setTimeout(() => {
      const success = queue.cancelTask('taskB');
      console.log(`\x1b[31mCanceled taskB:\x1b[0m \x1b[32m${success}\x1b[0m`); // true if canceled
    }, 50);

    // List the remaining IDs in the queue
    setTimeout(() => {
      const ids = queue.getQueuedIds();
      console.log(`\x1b[36mQueued IDs:\x1b[0m`, ids);
    }, 60);
  });
};

export default executeTinyPromiseQueue;

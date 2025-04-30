# `TinyPromiseQueue` Documentation 🎉

`TinyPromiseQueue` is a queue system designed to manage and execute asynchronous tasks in a sequential, one-at-a-time order. Tasks are executed in the order they are added to the queue, with support for optional delays ⏳, task cancellation ❌, and task reordering 🔄.

---

## Properties 🏠

- **`#queue`**: The internal queue array that holds all the tasks.
- **`#running`**: A flag indicating whether the queue is currently processing a task.
- **`#timeouts`**: An object storing timeouts for scheduled delays.
- **`#blacklist`**: A set of task IDs that should be skipped if already being processed or canceled.

---

## Methods 🛠️

### `isRunning()` 🏃‍♀️

Returns whether the queue is currently processing a task.

#### Returns:
- `boolean`: `true` if the queue is processing a task, otherwise `false`.

### `getIndexById(id)` 🔍

Returns the index of a task in the queue by its ID.

#### Parameters:
- `id` (`string`): The ID of the task to locate.

#### Returns:
- `number`: The index of the task in the queue, or `-1` if not found.

### `getQueuedIds()` 📋

Returns a list of IDs for all tasks currently in the queue.

#### Returns:
- `Array<{ index: number, id: string }>`: An array of task IDs and their corresponding indices.

### `reorderQueue(fromIndex, toIndex)` 🔄

Reorders a task in the queue from one index to another.

#### Parameters:
- `fromIndex` (`number`): The current index of the task to move.
- `toIndex` (`number`): The index where the task should be placed.

#### Returns:
- `void`: This method does not return anything.

### `enqueue(task, delay, id)` ⏳

Adds a new async task to the queue and ensures it runs in order after previous tasks. Optionally, a delay can be added before the task is executed.

If the task is canceled before execution, it will be rejected with the message:
**"The function was canceled on TinyPromiseQueue."**

#### Parameters:
- `task` (`Function`): A function that returns a `Promise` to be executed sequentially.
- `delay` (`number|null`): Optional delay (in ms) before the task is executed.
- `id` (`string`): Optional ID to identify the task in the queue.

#### Returns:
- `Promise<any>`: A promise that resolves or rejects with the result of the task once it's processed.

### `cancelTask(id)` ❌

Cancels a scheduled delay and removes the task from the queue. Adds the ID to a blacklist so the task is skipped if already being processed.

#### Parameters:
- `id` (`string`): The ID of the task to cancel.

#### Returns:
- `boolean`: `true` if a delay was cancelled and the task was removed, otherwise `false`.

---

## Usage Example 💻

```js
import { TinyPromiseQueue } from './TinyPromiseQueue';

const queue = new TinyPromiseQueue();

// Helper function to create simple tasks with logs
function createTask(name, duration = 500) {
  return () => new Promise((resolve) => {
    console.log(`Started task: ${name}`);
    setTimeout(() => {
      console.log(`Finished task: ${name}`);
      resolve(name);
    }, duration);
  });
}

// Enqueue 3 tasks
queue.enqueue(createTask('A'), 100, 'taskA');
queue.enqueue(createTask('B'), 0, 'taskB');
queue.enqueue(createTask('C'), 0, 'taskC');

// Wait for 50ms and cancel taskB
setTimeout(() => {
  const success = queue.cancelTask('taskB');
  console.log('Canceled taskB:', success); // true if cancelled
}, 50);

// List the remaining IDs in the queue
setTimeout(() => {
  const ids = queue.getQueuedIds();
  console.log('Queued IDs:', ids);
}, 60);
```

### Explanation 🧩:
1. **Task Creation**: Tasks are created with a name and an optional duration (in ms). The task logs its start and finish times 🕰️.
2. **Task Execution**: Tasks are enqueued one at a time, ensuring they run in the order they were added 🔁.
3. **Cancellation**: After 50ms, taskB is canceled, demonstrating the ability to remove a task from the queue ❌.
4. **Remaining Tasks**: The remaining tasks in the queue are logged after 60ms 📊.

---

## Conclusion 🎯

`TinyPromiseQueue` provides a simple and effective way to manage a sequence of asynchronous tasks. With its support for delays ⏳, task cancellation ❌, and reordering 🔄, it allows for efficient control over task execution in JavaScript.

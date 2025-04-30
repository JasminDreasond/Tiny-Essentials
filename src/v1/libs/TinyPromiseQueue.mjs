class TinyPromiseQueue {
  /**
   * @typedef {Object} QueuedTask
   * @property {() => Promise<any>} task - The async task to execute.
   * @property {(value: any) => any} resolve - The resolve function from the Promise.
   * @property {(reason?: any) => any} reject - The reject function from the Promise.
   * @property {string|undefined} [id] - Optional identifier for the task.
   * @property {number|null|undefined} [delay] - Optional delay (in ms) before the task is executed.
   */

  /** @type {Array<QueuedTask>} */
  #queue = [];
  #running = false;
  /** @type {Record<string, *>} */
  #timeouts = {};
  /** @type {Set<string>} */
  #blacklist = new Set();

  /**
   * Returns whether the queue is currently processing a task.
   *
   * @returns {boolean}
   */
  isRunning() {
    return this.#running;
  }

  /**
   * Processes the next task in the queue if not already running.
   * Ensures tasks are executed in order, one at a time.
   *
   * @returns {Promise<void>}
   */
  async #processQueue() {
    if (this.#running || this.#queue.length === 0) return;
    this.#running = true;
    const data = this.#queue.shift();
    if (
      data &&
      typeof data.task === 'function' &&
      typeof data.resolve === 'function' &&
      typeof data.reject === 'function'
    ) {
      const { task, resolve, reject, delay, id } = data;
      try {
        if (delay && id) {
          await new Promise((resolveDelay) => {
            const timeoutId = setTimeout(() => {
              delete this.#timeouts[id];
              resolveDelay(null);
            }, delay);
            this.#timeouts[id] = timeoutId;
          });
        }

        if (id && this.#blacklist.has(id)) {
          reject(new Error('The function was canceled on TinyPromiseQueue.'));
          this.#blacklist.delete(id);
          this.#running = false;
          this.#processQueue();
          return;
        }

        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.#running = false;
        this.#processQueue();
      }
    }
  }

  /**
   * Returns the index of a task by its ID.
   *
   * @param {string} id The ID of the task to locate.
   * @returns {number} The index of the task in the queue, or -1 if not found.
   */
  getIndexById(id) {
    return this.#queue.findIndex((item) => item.id === id);
  }

  /**
   * Returns a list of IDs for all tasks currently in the queue.
   *
   * @returns {{ index: number, id: string }[]} An array of task IDs currently queued.
   */
  getQueuedIds() {
    // @ts-ignore
    return this.#queue
      .map((item, index) => ({ index, id: item.id }))
      .filter((entry) => typeof entry.id === 'string');
  }

  /**
   * Reorders a task in the queue from one index to another.
   *
   * @param {number} fromIndex The current index of the task to move.
   * @param {number} toIndex The index where the task should be placed.
   */
  reorderQueue(fromIndex, toIndex) {
    if (
      typeof fromIndex !== 'number' ||
      typeof toIndex !== 'number' ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.#queue.length ||
      toIndex >= this.#queue.length
    )
      return;
    const [item] = this.#queue.splice(fromIndex, 1);
    this.#queue.splice(toIndex, 0, item);
  }

  /**
   * Adds a new async task to the queue and ensures it runs in order after previous tasks.
   * Optionally, a delay can be added before the task is executed.
   *
   * @param {(...args: any[]) => Promise<any>} task A function that returns a Promise to be executed sequentially.
   * @param {number|null} [delay] Optional delay (in ms) before the task is executed.
   * @param {string} [id] Optional ID to identify the task in the queue.
   * @returns {Promise<any>} A Promise that resolves or rejects with the result of the task once it's processed.
   */
  enqueue(task, delay, id) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ task, resolve, reject, id, delay });
      this.#processQueue();
    });
  }

  /**
   * Cancels a scheduled delay and removes the task from the queue.
   * Adds the ID to a blacklist so the task is skipped if already being processed.
   *
   * @param {string} id The ID of the task to cancel.
   * @returns {boolean} True if a delay was cancelled and the task was removed.
   */
  cancelTask(id) {
    if (!id) return false;
    let cancelled = false;

    if (id in this.#timeouts) {
      clearTimeout(this.#timeouts[id]);
      delete this.#timeouts[id];
      cancelled = true;
    }

    const index = this.getIndexById(id);
    if (index !== -1) {
      this.#queue.splice(index, 1);
      cancelled = true;
    }

    if (cancelled) this.#blacklist.add(id);

    return cancelled;
  }
}

export default TinyPromiseQueue;

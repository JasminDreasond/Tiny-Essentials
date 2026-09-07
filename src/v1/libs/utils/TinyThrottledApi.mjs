import TinyPromiseQueue from './TinyPromiseQueue.mjs';
import { waitForTrue } from '../../basics/promiseUtils.mjs';

/**
 * @template T
 * @typedef {Promise<T>} QueueResult
 * Represents the eventual result of a queued operation.
 */

/**
 * A client that manages asynchronous requests with a concurrency limit.
 * It uses TinyPromiseQueue to manage waiting tasks and waitForTrue to poll for availability.
 * @template {(...args: any) => Promise<any>} API
 */
class TinyThrottledApi {
  /** @type {number} The current number of active asynchronous operations. */
  #activeCount = 0;
  /** @type {number} The maximum number of concurrent operations allowed. */
  #concurrencyLimit;
  /** @type {TinyPromiseQueue} The internal queue used to manage pending tasks. */
  #queue = new TinyPromiseQueue();
  /** @type {API} The target API function to be executed. */
  #api;

  /**
   * Initializes a new instance of the TinyThrottledApi class.
   *
   * @param {number} concurrencyLimit - The maximum number of simultaneous requests.
   * @param {API} api - The API implementation.
   * @throws {TypeError} If concurrencyLimit is not a positive number.
   * @throws {TypeError} If API is not a function.
   */
  constructor(concurrencyLimit, api) {
    if (typeof concurrencyLimit !== 'number' || concurrencyLimit <= 0) {
      throw new TypeError('Concurrency limit must be a positive number.');
    }
    if (typeof api !== 'function') {
      throw new TypeError('API must be a function.');
    }

    this.#concurrencyLimit = concurrencyLimit;
    this.#api = api;
  }

  /**
   * Executes an API request, respecting the concurrency limit.
   *
   * @param {Parameters<API>} args
   * @returns {QueueResult<ReturnType<API>>} A promise that resolves with the API result.
   * @throws {TypeError} If the internal state is corrupted.
   */
  async exec(...args) {
    const id = crypto.randomUUID(); // Using UUID for better collision resistance

    // If we are under the limit, reserve the slot SYNCHRONOUSLY to prevent race conditions.
    if (this.#activeCount < this.#concurrencyLimit) {
      this.#activeCount++;
      return this.#performRequest(...args);
    }

    // If we reached the limit, queue a task that waits for a slot.
    return this.#queue.enqueue(
      async () => {
        // The task in the queue waits until a slot is available via polling.
        await waitForTrue(() => this.#activeCount < this.#concurrencyLimit);
        // Once available, we must reserve the slot before proceeding to #performRequest
        // to prevent other tasks from jumping in during the microtask gap.
        this.#activeCount++;
        return this.#performRequest(...args);
      },
      null,
      id,
    );
  }

  /**
   * Internal method to handle the actual execution and counter management.
   *
   * @param {Parameters<API>} args
   * @returns {QueueResult<ReturnType<API>>}
   */
  async #performRequest(...args) {
    try {
      return await this.#api(...args);
    } finally {
      // The decrement happens here, ensuring the slot is released even on failure.
      this.#activeCount--;
    }
  }

  /**
   * Gets the internal task queue.
   * @returns {TinyPromiseQueue} The internal task queue.
   */
  get queue() {
    return this.#queue;
  }

  /**
   * Gets the original API function.
   * @returns {API} The original API function.
   */
  get api() {
    return this.#api;
  }

  /**
   * Gets the current concurrency limit.
   * @returns {number} The current concurrency limit.
   */
  get concurrencyLimit() {
    return this.#concurrencyLimit;
  }

  /**
   * Sets a new concurrency limit.
   * @param {number} value - The new maximum number of simultaneous requests.
   * @throws {TypeError} If value is not a positive number.
   */
  set concurrencyLimit(value) {
    if (typeof value !== 'number' || value <= 0) {
      throw new TypeError('Concurrency limit must be a positive number.');
    }
    this.#concurrencyLimit = value;
  }

  /**
   * Returns the number of currently active requests.
   *
   * @returns {number}
   */
  get activeCount() {
    return this.#activeCount;
  }

  /**
   * Returns the number of tasks waiting in the queue.
   *
   * @returns {number}
   */
  get queuedCount() {
    return this.#queue.getQueuedIds().length;
  }
}

export default TinyThrottledApi;

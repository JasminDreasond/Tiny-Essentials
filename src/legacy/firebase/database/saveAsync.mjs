// @ts-nocheck

/**
 * Class representing an asynchronous save system with callback support.
 *
 * This class is designed to handle database operations asynchronously and supports
 * adding multiple operations to a queue, as well as running callbacks after each action.
 *
 * @class SaveAsync
 */
class SaveAsync {
  /**
   * Creates an instance of SaveAsync.
   *
   * @param {object} db - The database reference to interact with (e.g., Firebase or other DB).
   */
  constructor(db) {
    this.db = db;
    this.list = [];
    this.callbacks = {};
    this.using = false;
  }

  /**
   * Registers a callback to be run when a specific action type is executed.
   *
   * @param {string} where - The action type (e.g., "set", "push", etc.).
   * @param {Function} callback - The callback function to run when the action is performed.
   * @returns {boolean} Returns `true` if the callback is successfully registered.
   */
  on(where, callback) {
    if (!Array.isArray(this.callbacks[where])) this.callbacks[where] = [];
    this.callbacks[where].push(callback);
    return true;
  }

  /**
   * Runs all callbacks associated with a specific action type.
   *
   * @param {string} type - The action type (e.g., "set", "push", etc.).
   * @param {any} data - The data passed to the callback(s).
   * @param {string} [where] - The location (optional) where the action was performed.
   */
  _runCallbacks(type, data, where) {
    if (Array.isArray(this.callbacks[type]))
      for (const item in this.callbacks[type])
        if (typeof this.callbacks[type][item] === 'function')
          this.callbacks[type][item](data, where);
  }

  /**
   * Processes the queued actions and executes them one by one.
   *
   * Each action in the queue is processed asynchronously. Once one action completes,
   * the next action in the queue is triggered.
   */
  action() {
    // Insert
    if (this.list.length > 0) {
      // Get Item
      const post = this.list.shift();
      const tinyThis = this;

      // Try
      try {
        if (typeof post.where !== 'string') {
          if (post.data) {
            this.db[post.type](post.data)
              .then(() => {
                this._runCallbacks(post.type, post.data);
                tinyThis.action();
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            this.db[post.type]()
              .then(() => {
                this._runCallbacks(post.type);
                tinyThis.action();
              })
              .catch((err) => {
                console.error(err);
              });
          }
        } else {
          if (post.data) {
            this.db
              .child(post.where)
              [post.type](post.data)
              .then(() => {
                this._runCallbacks(post.type, post.data, post.where);
                tinyThis.action();
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            this.db
              .child(post.where)
              [post.type]()
              .then(() => {
                this._runCallbacks(post.type, null, post.where);
                tinyThis.action();
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      } catch (err) {
        // Error
        console.error(err);
      }
    }

    // Nope
    else this.using = false;
  }

  /**
   * Inserts a new action into the queue.
   *
   * The action will be executed when the system is ready (i.e., when the queue is not in use).
   *
   * @param {object} [data={}] - The data to be saved (optional).
   * @param {string} [type='set'] - The type of the database action (e.g., 'set', 'push', etc.).
   * @param {string|null} [where=null] - The location where the data should be stored (optional).
   */
  insert(data = {}, type = 'set', where = null) {
    // Insert
    if (data !== null) {
      if (where !== null) this.list.push({ where: String(where), data: data, type: type });
      else this.list.push({ data: data, type: type });
    } else {
      if (where !== null) this.list.push({ where: String(where), type: type });
      else this.list.push({ type: type });
    }

    if (!this.using) {
      this.using = true;
      this.action();
    }
  }
}

// Module export
export default SaveAsync;

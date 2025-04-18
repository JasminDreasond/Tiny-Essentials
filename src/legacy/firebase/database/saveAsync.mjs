// Class
class SaveAsync {
  // Constructor
  constructor(db) {
    this.db = db;
    this.list = [];
    this.callbacks = {};
    this.using = false;
  }

  on(where, callback) {
    if (!Array.isArray(this.callbacks[where])) this.callbacks[where] = [];
    this.callbacks[where].push(callback);
    return true;
  }

  _runCallbacks(type, data, where) {
    if (Array.isArray(this.callbacks[type]))
      for (const item in this.callbacks[type])
        if (typeof this.callbacks[type][item] === 'function')
          this.callbacks[type][item](data, where);
  }

  // Action
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

  // Insert
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

// Moudule
export default SaveAsync;

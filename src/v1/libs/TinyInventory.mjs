class TinyInventory {
  /**
   * Registry of all item definitions for TinyInventory.
   * @type {Map<string, Object>}
   */
  static ItemRegistry = new Map();

  /**
   * Defines or updates an item type in the registry.
   * @param {Object} config
   * @param {string} config.id - Unique ID for the item type.
   * @param {string} config.name - Display name of the item.
   * @param {number} [config.weight=0] - Weight of the item.
   * @param {Object} [config.metadata={}] - Custom metadata for the item.
   * @param {function} [config.onUse] - Callback triggered when the item is used.
   * @param {Object} [config.extra] - Any other custom configurations.
   */
  static defineItem(config) {
    if (!config?.id || typeof config.id !== 'string') {
      throw new Error("Item must have a valid string 'id'.");
    }
    TinyInventory.ItemRegistry.set(config.id, {
      id: config.id,
      name: config.name || config.id,
      weight: config.weight || 0,
      maxStack: config.maxStack || 1,
      metadata: config.metadata || {},
      onUse: typeof config.onUse === 'function' ? config.onUse : null,
      extra: config.extra || {},
    });
  }

  /**
   * @param {Object} options
   * @param {number} [options.maxWeight] - Maximum weight allowed (optional).
   * @param {number} [options.maxSlots] - Maximum number of total slots allowed (optional).
   * @param {boolean} [options.useSections=false] - Whether to split inventory into sections.
   * @param {Array<Object>} [options.sections=[]] - Section configurations if using sections.
   * @param {Array<string>} [options.specialSlots=[]] - Special slot IDs (e.g., "helmet", "hand").
   */
  constructor(options = {}) {
    this.maxWeight = options.maxWeight ?? null;
    this.maxSlots = options.maxSlots ?? null;
    this.useSections = !!options.useSections;
    this.sections = this.useSections ? this.#initSections(options.sections ?? []) : null;
    this.specialSlots = new Map((options.specialSlots ?? []).map((slot) => [slot, null]));
    this.items = this.useSections ? null : new Set();

    // Event listeners
    this.events = {
      add: [],
      remove: [],
      use: [],
    };
  }

  /**
   * @param {Array<Object>} sectionConfigs
   */
  #initSections(sectionConfigs) {
    if (!Array.isArray(sectionConfigs)) throw new Error('Sections must be an array.');
    return sectionConfigs.map((cfg) => ({
      id: cfg.id || `section_${Math.random().toString(36).substr(2, 5)}`,
      slots: cfg.slots || 10,
      items: new Set(),
    }));
  }

  calculateWeight() {
    return this.getAllItems().reduce((total, item) => {
      const def = TinyInventory.ItemRegistry.get(item.id);
      return total + (def?.weight || 0) * item.quantity;
    }, 0);
  }

  hasSpace() {
    if (this.maxSlots !== null && this.getAllItems().length >= this.maxSlots) {
      return false;
    }
    if (this.maxWeight !== null && this.calculateWeight() > this.maxWeight) {
      return false;
    }
    return true;
  }

  /** --------------------- PUBLIC METHODS --------------------- */

  #triggerEvent(type, payload) {
    if (this.events[type]) {
      for (const cb of this.events[type]) cb(payload);
    }
  }

  onAddItem(callback) {
    this.events.add.push(callback);
  }
  onRemoveItem(callback) {
    this.events.remove.push(callback);
  }
  onUseItem(callback) {
    this.events.use.push(callback);
  }

  /**
   * @param {string} itemId
   * @param {number} quantity
   * @param {string|null} [targetSection=null]
   */
  addItem(itemId, quantity = 1, targetSection = null) {
    const def = TinyInventory.ItemRegistry.get(itemId);
    if (!def) throw new Error(`Item '${itemId}' not defined in registry.`);

    let remaining = quantity;

    const placeItem = (collection) => {
      for (const existing of collection) {
        if (existing.id === itemId && existing.quantity < def.maxStack) {
          const canAdd = Math.min(def.maxStack - existing.quantity, remaining);
          existing.quantity += canAdd;
          remaining -= canAdd;
          if (remaining <= 0) return;
        }
      }
      while (remaining > 0) {
        if (!this.hasSpace()) throw new Error('Inventory is full or overweight.');
        const stackQty = Math.min(def.maxStack, remaining);
        collection.add({ id: itemId, quantity: stackQty });
        remaining -= stackQty;
      }
    };

    if (targetSection && this.useSections) {
      const section = this.sections.find((s) => s.id === targetSection);
      if (!section) throw new Error(`Section '${targetSection}' not found.`);
      placeItem(section.items);
    } else if (!this.useSections) {
      placeItem(this.items);
    } else {
      throw new Error('Target section required for section-based inventory.');
    }

    this.#triggerEvent('add', { itemId, quantity });
  }

  /**
   * @param {string} itemId
   * @param {number} quantity
   */
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;
    const collections = this.useSections ? this.sections.map((s) => s.items) : [this.items];

    for (const collection of collections) {
      for (const item of Array.from(collection)) {
        if (item.id === itemId) {
          const removeQty = Math.min(item.quantity, remaining);
          item.quantity -= removeQty;
          remaining -= removeQty;
          if (item.quantity <= 0) collection.delete(item);
          if (remaining <= 0) {
            this.#triggerEvent('remove', { itemId, quantity });
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * @param {string} itemId
   */
  useItem(itemId, ...args) {
    const item = this.getAllItems().find((it) => it.id === itemId);
    if (!item) throw new Error(`Item '${itemId}' not found in inventory.`);
    const def = TinyInventory.ItemRegistry.get(itemId);

    if (def?.onUse) {
      const result = def.onUse({
        inventory: this,
        item,
        metadata: def.metadata,
        remove: () => this.removeItem(itemId, 1),
        ...args,
      });
      this.#triggerEvent('use', { itemId });
      return result;
    }
    return null;
  }

  equipItem(slotId, itemId) {
    if (!this.specialSlots.has(slotId)) {
      throw new Error(`Special slot '${slotId}' does not exist.`);
    }
    const item = this.getAllItems().find((it) => it.id === itemId);
    if (!item) throw new Error(`Item '${itemId}' not found.`);
    this.specialSlots.set(slotId, item);
  }

  unequipItem(slotId) {
    if (!this.specialSlots.has(slotId)) {
      throw new Error(`Special slot '${slotId}' does not exist.`);
    }
    this.specialSlots.set(slotId, null);
  }

  getAllItems() {
    return this.useSections
      ? this.sections.flatMap((s) => Array.from(s.items))
      : Array.from(this.items);
  }

  getItemsByMetadata(filterFn) {
    return this.getAllItems().filter((item) => {
      const def = TinyInventory.ItemRegistry.get(item.id);
      return def && filterFn(def.metadata, item);
    });
  }

  findItem(predicate) {
    return this.getAllItems().find(predicate);
  }

  findItems(predicate) {
    return this.getAllItems().filter(predicate);
  }

  getItemCount(itemId) {
    return this.getAllItems()
      .filter((it) => it.id === itemId)
      .reduce((sum, it) => sum + it.quantity, 0);
  }

  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }

  toJSON() {
    return JSON.stringify({
      maxWeight: this.maxWeight,
      maxSlots: this.maxSlots,
      useSections: this.useSections,
      sections: this.sections
        ? this.sections.map((s) => ({
            id: s.id,
            slots: s.slots,
            items: Array.from(s.items),
          }))
        : null,
      items: this.items ? Array.from(this.items) : null,
      specialSlots: Array.from(this.specialSlots.entries()),
    });
  }

  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const inv = new TinyInventory({
      maxWeight: data.maxWeight,
      maxSlots: data.maxSlots,
      useSections: data.useSections,
      sections: data.sections?.map((s) => ({ id: s.id, slots: s.slots })),
      specialSlots: data.specialSlots?.map(([k]) => k),
    });
    if (inv.useSections && data.sections) {
      for (let i = 0; i < data.sections.length; i++) {
        for (const item of data.sections[i].items) {
          inv.sections[i].items.add(item);
        }
      }
    } else if (data.items) {
      for (const item of data.items) {
        inv.items.add(item);
      }
    }
    for (const [slot, value] of data.specialSlots || []) {
      inv.specialSlots.set(slot, value);
    }
    return inv;
  }
}

export default TinyInventory;

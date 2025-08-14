/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {string} name
 * @property {number} weight
 * @property {InventoryMetadata} metadata
 * @property {boolean} canStack
 * @property {number} maxStack
 * @property {Function | null} onUse
 * @property {string|null} type
 */

/**
 * @typedef {Record<string|number|symbol, any>} InventoryMetadata
 */

class TinyInventory {
  /**
   * Registry of all item definitions available in TinyInventory.
   * Keys are item IDs, values are configuration objects created with {@link TinyInventory.defineItem}.
   * @type {Map<string, InventoryItem>}
   */
  static ItemRegistry = new Map();

  /**
   * Defines or updates an item type in the global item registry.
   * This is used to set metadata such as name, weight, stackability, and custom behavior.
   *
   * @param {Object} config - Item configuration object.
   * @param {string} config.id - Unique identifier for the item.
   * @param {string} config.name - Display name for the item.
   * @param {number} [config.weight=0] - Weight of a single unit of the item.
   * @param {InventoryMetadata} [config.metadata={}] - Default metadata for the item type.
   * @param {boolean} [config.canStack=false] - Whether this item can be stacked in inventory.
   * @param {number} [config.maxStack=1] - Maximum quantity per stack.
   * @param {function|null} [config.onUse] - Optional callback triggered when the item is used.
   * @param {string|null} [config.type=null] -
   * @throws {Error} If the `id` is missing or not a string.
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
      canStack: config.canStack ?? false,
      type: config.type ?? null,
      onUse: typeof config.onUse === 'function' ? config.onUse : null,
    });
  }

  /**
   * Creates a new TinyInventory instance.
   *
   * @param {Object} [options={}] - Configuration options for the inventory.
   * @param {number|null} [options.maxWeight=null] - Maximum allowed total weight (null for no limit).
   * @param {number|null} [options.maxSlots=null] - Maximum number of item slots (null for no limit).
   * @param {boolean} [options.useSections=false] - Whether inventory is divided into separate sections.
   * @param {Array<Object>} [options.sections=[]] - Section definitions (only used if `useSections` is true).
   * @param {Array<string>} [options.specialSlots=[]] - IDs for special slots (e.g., "helmet", "weapon").
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
   * Initializes section data structures.
   * @param {Array<Object>} sectionConfigs - Array of section configuration objects.
   * @returns {Array<{id: string, slots: number, items: Set}>} Array of section objects.
   * @throws {Error} If `sectionConfigs` is not an array.
   */
  #initSections(sectionConfigs) {
    if (!Array.isArray(sectionConfigs)) throw new Error('Sections must be an array.');
    return sectionConfigs.map((cfg) => ({
      id: cfg.id || `section_${Math.random().toString(36).substr(2, 5)}`,
      slots: cfg.slots || 10,
      items: new Set(),
    }));
  }

  /**
   * Calculates the total weight of all items in the inventory.
   * @returns {number} The total weight.
   */
  calculateWeight() {
    return this.getAllItems().reduce((total, item) => {
      const def = TinyInventory.ItemRegistry.get(item.id);
      if (!def) throw new Error(`Item '${item.id}' not defined in registry.`);
      return total + (def?.weight || 0) * item.quantity;
    }, 0);
  }
  /**
   * Checks if there is available space based on slot and weight limits.
   * @returns {boolean} True if there is space; false otherwise.
   */
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

  /**
   * Internal event trigger.
   * @param {'add'|'remove'|'use'} type - Event type.
   * @param {Object} payload - Event data passed to listeners.
   */
  #triggerEvent(type, payload) {
    if (this.events[type]) {
      for (const cb of this.events[type]) cb(payload);
    }
  }

  /**
   * Registers a callback to be executed when an item is added.
   * @param {function} callback - Function receiving the event payload.
   */
  onAddItem(callback) {
    this.events.add.push(callback);
  }

  /**
   * Registers a callback to be executed when an item is removed.
   * @param {function} callback - Function receiving the event payload.
   */
  onRemoveItem(callback) {
    this.events.remove.push(callback);
  }

  /**
   * Registers a callback to be executed when an item is used.
   * @param {function} callback - Function receiving the event payload.
   */
  onUseItem(callback) {
    this.events.use.push(callback);
  }

  /**
   * Adds an item to the inventory, respecting stackability rules, stack limits, and metadata matching.
   * If the item cannot be fully added (e.g., due to stack limits), the remaining quantity is returned.
   *
   * @param {string} itemId - ID of the item to add.
   * @param {number} [quantity=1] - Quantity to add.
   * @param {string|null} [targetSection=null] - Section ID (if using sections).
   * @param {InventoryMetadata} [metadata={}] - Instance-specific metadata (must match for stacking).
   * @returns {number} Quantity that could not be added (0 if all were added).
   * @throws {Error} If the item is not registered or the section is invalid.
   */
  addItem(itemId, quantity = 1, targetSection = null, metadata = {}) {
    const def = TinyInventory.ItemRegistry.get(itemId);
    if (!def) throw new Error(`Item '${itemId}' not defined in registry.`);

    let remaining = quantity;
    const metadataEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    const placeItem = (collection) => {
      // Try stacking only if allowed
      if (def.canStack) {
        for (const existing of collection) {
          if (
            existing.id === itemId &&
            existing.quantity < def.maxStack &&
            metadataEquals(existing.metadata || {}, metadata)
          ) {
            const canAdd = Math.min(def.maxStack - existing.quantity, remaining);
            existing.quantity += canAdd;
            remaining -= canAdd;
            if (remaining <= 0) return;
          }
        }
      }

      // Add new stacks (or single items if canStack is false)
      while (remaining > 0) {
        if (!this.hasSpace()) throw new Error('Inventory is full or overweight.');
        const stackQty = def.canStack ? Math.min(def.maxStack, remaining) : 1;
        collection.add({ id: itemId, quantity: stackQty, metadata });
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

    this.#triggerEvent('add', { itemId, quantity: quantity - remaining, metadata });

    // Return remaining if some quantity couldn't be added due to maxStack
    return remaining;
  }

  /**
   * Removes a given quantity of an item from the inventory.
   * @param {string} itemId - ID of the item to remove.
   * @param {number} [quantity=1] - Quantity to remove.
   * @returns {boolean} True if the requested quantity was removed; false if insufficient quantity.
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
   * Uses an item, triggering its `onUse` callback if defined.
   * Automatically removes one quantity if `remove` is called inside the callback.
   *
   * @param {string} itemId - ID of the item to use.
   * @param {...any} args - Additional arguments passed to the `onUse` handler.
   * @returns {any} The return value of the `onUse` callback, or `null` if no callback exists.
   * @throws {Error} If the item is not found in the inventory.
   */
  useItem(itemId, ...args) {
    const item = this.getAllItems().find((it) => it.id === itemId);
    if (!item) throw new Error(`Item '${itemId}' not found in inventory.`);
    const def = TinyInventory.ItemRegistry.get(itemId);
    if (!def) throw new Error(`Item '${itemId}' not defined in registry.`);

    if (def.onUse) {
      const onUse = {
        inventory: this,
        item,
        metadata: def.metadata,
        remove: () => this.removeItem(itemId, 1),
        ...args,
      };

      const result = def.onUse(onUse);
      this.#triggerEvent('use', { ...onUse, itemId });
      return result;
    }
    return null;
  }

  /**
   * Equips an item into a special slot, removing it from the main inventory.
   * If another item is already equipped, it is moved back into the inventory.
   *
   * @param {string} slotId - ID of the special slot.
   * @param {string} itemId - ID of the item to equip.
   * @throws {Error} If the slot does not exist or the item cannot be equipped in that slot.
   */
  equipItem(slotId, itemId) {
    if (!this.specialSlots.has(slotId)) throw new Error(`Special slot '${slotId}' does not exist.`);

    const item = this.getAllItems().find((it) => it.id === itemId);
    if (!item) throw new Error(`Item '${itemId}' not found in inventory.`);

    const def = TinyInventory.ItemRegistry.get(itemId);
    if (!def) throw new Error(`Item '${itemId}' not defined in registry.`);
    const slotType = this.specialSlots.get(slotId)?.type || 'any';
    if (slotType !== 'any' && def.type !== slotType) {
      throw new Error(`Item '${itemId}' cannot be equipped in slot '${slotId}'`);
    }

    // Remove 1 inventory unit
    this.removeItem(itemId, 1);

    // If there is already something equipped in this slot, return to inventory
    const current = this.specialSlots.get(slotId);
    if (current) {
      this.addItem(current.id, 1, null, current.metadata);
    }

    // Equip new piece (maintains only id and quantity = 1)
    this.specialSlots.set(slotId, { id: itemId, quantity: 1, metadata: item.metadata });
  }

  /**
   * Unequips an item from a special slot and returns it to the inventory.
   * @param {string} slotId - ID of the special slot.
   * @returns {boolean} True if an item was unequipped; false if the slot was already empty.
   * @throws {Error} If the slot does not exist.
   */
  unequipItem(slotId) {
    if (!this.specialSlots.has(slotId)) throw new Error(`Special slot '${slotId}' does not exist.`);

    const current = this.specialSlots.get(slotId);
    if (!current) return false; // Empty slot

    // Remove from Special Slot
    this.specialSlots.set(slotId, null);

    // Try to add back to inventory
    this.addItem(current.id, 1, null, current.metadata);
    return true;
  }

  /**
   * Returns all items currently stored in the inventory (across all sections if applicable).
   * @returns {InventoryItem[]} Array of item objects.
   */
  getAllItems() {
    return this.useSections
      ? this.sections.flatMap((s) => Array.from(s.items))
      : Array.from(this.items);
  }

  /**
   * Finds all items matching a given metadata filter function.
   * @param {function(Object, Object): boolean} filterFn - Function receiving (itemTypeMetadata, itemInstance).
   * @returns {InventoryItem[]} Array of matching items.
   */
  getItemsByMetadata(filterFn) {
    return this.getAllItems().filter((item) => {
      const def = TinyInventory.ItemRegistry.get(item.id);
      if (!def) throw new Error(`Item '${item.id}' not defined in registry.`);
      return filterFn(def.metadata, item);
    });
  }

  /**
   * Finds the first item matching the given predicate.
   * @param {function(Object): boolean} predicate - Function receiving the item instance.
   * @returns {Object|undefined} The first matching item, or undefined if none match.
   */
  findItem(predicate) {
    return this.getAllItems().find(predicate);
  }

  /**
   * Finds all items matching the given predicate.
   * @param {function(Object): boolean} predicate - Function receiving the item instance.
   * @returns {InventoryItem[]} Array of matching items.
   */
  findItems(predicate) {
    return this.getAllItems().filter(predicate);
  }

  /**
   * Counts the total quantity of a given item in the inventory.
   * @param {string} itemId - Item ID to count.
   * @returns {number} Total quantity of that item.
   */
  getItemCount(itemId) {
    return this.getAllItems()
      .filter((it) => it.id === itemId)
      .reduce((sum, it) => sum + it.quantity, 0);
  }

  /**
   * Checks whether the inventory contains at least the given quantity of an item.
   * @param {string} itemId - Item ID to check.
   * @param {number} [quantity=1] - Quantity to check.
   * @returns {boolean} True if the inventory has the quantity or more.
   */
  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }

  /**
   * Serializes the inventory into a JSON string.
   * @returns {string} Serialized JSON representation of the inventory.
   */
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

  /**
   * Creates a TinyInventory instance from serialized JSON data.
   * @param {string|Object} json - JSON string or parsed object.
   * @returns {TinyInventory} New inventory instance populated with the saved data.
   */
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

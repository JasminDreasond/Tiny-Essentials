/**
 * Represents a registered item definition in the global registry.
 *
 * @typedef {Object} ItemDef
 * @property {string} id - Unique identifier for the item.
 * @property {number} weight - Weight of a single unit of the item.
 * @property {InventoryMetadata} metadata - Default metadata for the item type.
 * @property {boolean} canStack - Whether multiple units can be stacked together.
 * @property {number} maxStack - Maximum quantity per stack (ignored if `canStack` is false).
 * @property {Function|null} onUse - Callback triggered when the item is used.
 * @property {string|null} type - Optional category/type identifier.
 */

/**
 * Represents an individual stored item instance in the inventory.
 *
 * @typedef {Object} InventoryItem
 * @property {string} id - Unique identifier for the item.
 * @property {InventoryMetadata} metadata - Metadata specific to this item instance.
 * @property {number} quantity - Number of units in this stack.
 */

/**
 * Configuration object for creating a section in the inventory.
 *
 * @typedef {Object} SectionCfg
 * @property {string} [id] - Optional unique section identifier.
 * @property {number} [slots=10] - Maximum number of item slots in the section.
 * @property {InvSlots} items - Items contained in the section.
 */

/**
 * Represents an active inventory section with its stored items.
 *
 * @typedef {Object} InvSection
 * @property {string} id - Unique identifier for the section.
 * @property {number} slots - Maximum number of item slots.
 * @property {InvSlots} items - Items currently stored in this section.
 */

/**
 * A collection of item stacks stored in the inventory.
 *
 * @typedef {Set<InventoryItem|null>} InvSlots
 */

/**
 * Metadata object used to store arbitrary key-value pairs for an item.
 *
 * @typedef {Record<string|number|symbol, any>} InventoryMetadata
 */

/**
 * Represents a special slot (e.g., equipment) in the inventory.
 *
 * @typedef {Object} SpecialSlot
 * @property {string|null} type - Optional slot category/type.
 * @property {InventoryItem|null} item - Item currently equipped in this slot.
 */

/**
 * Event fired when an item is added to the inventory.
 *
 * @typedef {Function} AddItemEvent
 */

/**
 * Event fired when an item is setted to the inventory.
 *
 * @typedef {Function} SetItemEvent
 */

/**
 * Event fired when an item is removed from the inventory.
 *
 * @typedef {Function} RemoveItemEvent
 */

/**
 * Event fired when an item is used.
 *
 * @typedef {Function} UseItemEvent
 */

/**
 * Represents the fully serialized structure of a TinyInventory instance.
 * Intended for pure JSON storage and transmission.
 *
 * @typedef {Object} SerializedInventory
 * @property {'TinyInventory'} __schema - Schema identifier for validation.
 * @property {number} version - Serialized format version.
 * @property {number|null} maxWeight - Maximum allowed weight, or null if unlimited.
 * @property {number|null} maxSlots - Maximum allowed slots, or null if unlimited.
 * @property {boolean} useSections - Whether the inventory uses sections.
 * @property {Array<{
 *   id: string;
 *   slots: number;
 *   items: (InventoryItem|null)[];
 * }> | null} sections - List of section definitions with their items, or null if not using sections.
 * @property {(InventoryItem|null)[] | null} items - Flat inventory items if not using sections, or null if using sections.
 * @property {Record<string, SpecialSlot>} specialSlots - Special equipment or reserved slots keyed by ID.
 */

class TinyInventory {
  /**
   * Registry of all item definitions available in TinyInventory.
   * Keys are item IDs, values are configuration objects created with {@link TinyInventory.defineItem}.
   * @type {Map<string, ItemDef>}
   */
  static ItemRegistry = new Map();

  /**
   * Defines or updates an item type in the global item registry.
   * Stores key properties such as weight, stackability rules, and optional behavior callbacks.
   *
   * @param {Object} config - Item configuration object.
   * @param {string} config.id - Unique identifier for the item.
   * @param {number} [config.weight=0] - Weight of a single unit of the item.
   * @param {InventoryMetadata} [config.metadata={}] - Default metadata for the item type.
   * @param {boolean} [config.canStack=false] - Whether multiple units of this item can be combined into a single stack.
   * @param {number} [config.maxStack=1] - Maximum quantity allowed in a single stack (ignored if `canStack` is false).
   * @param {function|null} [config.onUse=null] - Optional callback executed when the item is used.
   * @param {string|null} [config.type=null] - Optional type/category identifier for the item.
   * @throws {Error} If `id` is missing or not a string.
   */
  static defineItem(config) {
    if (!config?.id || typeof config.id !== 'string') {
      throw new Error("Item must have a valid string 'id'.");
    }
    TinyInventory.ItemRegistry.set(config.id, {
      id: config.id,
      weight: config.weight || 0,
      maxStack: config.maxStack || 1,
      metadata: config.metadata || {},
      canStack: config.canStack ?? false,
      type: config.type ?? null,
      onUse: typeof config.onUse === 'function' ? config.onUse : null,
    });
  }

  /** @type {Map<string, SpecialSlot>} */
  specialSlots = new Map();

  /**
   * Event listeners
   */
  events = {
    /** @type {AddItemEvent[]} */
    add: [],
    /** @type {RemoveItemEvent[]} */
    remove: [],
    /** @type {UseItemEvent[]} */
    use: [],
    /** @type {SetItemEvent[]} */
    set: [],
  };

  /** @type {InvSection[] | null} */
  sections;

  /** @type {InvSlots | null} */
  items;

  /** @type {boolean} */
  useSections;

  /**
   * Creates a new TinyInventory instance.
   *
   * @param {Object} [options={}] - Configuration options for the inventory.
   * @param {number|null} [options.maxWeight=null] - Maximum allowed total weight (null for no limit).
   * @param {number|null} [options.maxSlots=null] - Maximum number of item slots (null for no limit).
   * @param {boolean} [options.useSections=false] - Whether inventory is divided into separate sections.
   * @param {SectionCfg[]} [options.sections=[]] - Section definitions (only used if `useSections` is true).
   * @param {Record<string, { type: string | null; }>} [options.specialSlots] - IDs for special slots (e.g., "helmet", "weapon").
   */
  constructor(options = {}) {
    this.maxWeight = options.maxWeight ?? null;
    this.maxSlots = options.maxSlots ?? null;
    this.useSections = !!options.useSections;
    this.sections = this.useSections ? this.#initSections(options.sections ?? []) : null;
    this.items = this.useSections ? null : new Set();
    if (options.specialSlots) {
      for (const name in options.specialSlots) {
        this.specialSlots.set(name, { type: options.specialSlots[name].type ?? null, item: null });
      }
    }
  }

  /**
   * Initializes section data structures.
   * @param {SectionCfg[]} sectionConfigs - Array of section configuration objects.
   * @returns {InvSection[]} Array of section objects.
   * @throws {Error} If `sectionConfigs` is not an array.
   */
  #initSections(sectionConfigs) {
    if (!Array.isArray(sectionConfigs)) throw new Error('Sections must be an array.');
    return sectionConfigs.map((cfg) => ({
      id: cfg.id || `section_${Math.random().toString(36).substring(2, 5)}`,
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
   * @param {'add'|'remove'|'use'|'set'} type - Event type.
   * @param {Object} payload - Event data passed to listeners.
   */
  #triggerEvent(type, payload) {
    if (this.events[type]) {
      for (const cb of this.events[type]) cb(payload);
    }
  }

  /**
   * Registers a callback to be executed when an item is added.
   * @param {AddItemEvent} callback - Function receiving the event payload.
   */
  onAddItem(callback) {
    this.events.add.push(callback);
  }

  /**
   * Registers a callback to be executed when an item is removed.
   * @param {SetItemEvent} callback - Function receiving the event payload.
   */
  onSetItem(callback) {
    this.events.set.push(callback);
  }

  /**
   * Registers a callback to be executed when an item is removed.
   * @param {RemoveItemEvent} callback - Function receiving the event payload.
   */
  onRemoveItem(callback) {
    this.events.remove.push(callback);
  }

  /**
   * Registers a callback to be executed when an item is used.
   * @param {UseItemEvent} callback - Function receiving the event payload.
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

    /**
     * @param {InventoryMetadata} a
     * @param {InventoryMetadata} b
     */
    const metadataEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    /** @param {InvSlots} collection */
    const placeItem = (collection) => {
      // Try stacking only if allowed
      if (def.canStack) {
        for (const existing of collection) {
          if (
            existing &&
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

    if (targetSection && this.useSections && this.sections) {
      const section = this.sections.find((s) => s.id === targetSection);
      if (!section) throw new Error(`Section '${targetSection}' not found.`);
      placeItem(section.items);
    } else if (!this.useSections && this.items) {
      placeItem(this.items);
    } else {
      throw new Error('Target section required for section-based inventory.');
    }

    this.#triggerEvent('add', { itemId, quantity: quantity - remaining, metadata });

    // Return remaining if some quantity couldn't be added due to maxStack
    return remaining;
  }

  /**
   * Sets an item at a specific slot index, replacing whatever was there.
   * Can also be used to place `null` in the slot to clear it.
   *
   * @param {number} slotIndex - Index of the slot to set.
   * @param {InventoryItem|null} item - Item to place in the slot, or null to clear.
   * @param {string|null} [targetSection=null] - Section ID (if using sections).
   * @throws {Error} If the section is invalid or index is out of range.
   */
  setItem(slotIndex, item, targetSection = null) {
    /** @type {InvSlots|null} */
    let collection = null;

    if (targetSection && this.useSections && this.sections) {
      const section = this.sections.find((s) => s.id === targetSection);
      if (!section) throw new Error(`Section '${targetSection}' not found.`);
      if (slotIndex < 0 || slotIndex >= section.slots) {
        throw new Error(`Slot index ${slotIndex} out of range for section '${targetSection}'.`);
      }
      collection = section.items;
    } else if (!this.useSections && this.items) {
      if (this.maxSlots !== null && (slotIndex < 0 || slotIndex >= this.maxSlots)) {
        throw new Error(`Slot index ${slotIndex} out of range.`);
      }
      collection = this.items;
    } else {
      throw new Error('Target section required for section-based inventory.');
    }

    // Convert the set to an array for index-based manipulation
    const slotsArray = Array.from(collection);

    // Fill empty slots with nulls if necessary
    while (
      this.maxSlots !== null &&
      slotsArray.length < (this.useSections ? collection.size : this.maxSlots)
    ) {
      slotsArray.push(null);
    }

    // Set the slot
    slotsArray[slotIndex] = item;

    // Rebuild the collection from the updated array
    collection.clear();
    for (const slot of slotsArray) {
      if (slot !== undefined) collection.add(slot);
    }

    this.#triggerEvent('set', { slotIndex, item, targetSection });
  }

  /**
   * Removes a given quantity of an item from the inventory.
   * @param {string} itemId - ID of the item to remove.
   * @param {number} [quantity=1] - Quantity to remove.
   * @returns {boolean} True if the requested quantity was removed; false if insufficient quantity.
   */
  removeItem(itemId, quantity = 1) {
    let remaining = quantity;
    const collections = this.useSections
      ? this.sections
        ? this.sections.map((s) => s.items)
        : []
      : [this.items];

    for (const index in collections) {
      const collection = collections[index];
      if (!collection) continue;
      for (const item of Array.from(collection)) {
        if (item && item.id === itemId) {
          const removeQty = Math.min(item.quantity, remaining);
          item.quantity -= removeQty;
          remaining -= removeQty;
          if (item.quantity <= 0) collection.delete(item);
          if (remaining <= 0) {
            this.#triggerEvent('remove', {
              index,
              itemId,
              quantity: quantity - remaining,
              collection,
            });
            return true;
          }
        }
      }
    }

    /** @type {boolean} */
    let deletedItem = false;
    this.specialSlots.forEach((value, key) => {
      if (value.item && value.item.id === itemId) {
        value.item = null;
        this.#triggerEvent('remove', { index: key, itemId, quantity: 1, collection: null });
        deletedItem = true;
      }
    });
    return deletedItem;
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
    const current = this.specialSlots.get(slotId);
    if (!current) throw new Error(`Slot '${slotId}' not defined in registry.`);
    const slotType = current.type ?? null;
    if (slotType !== null && def.type !== slotType)
      throw new Error(`Item '${itemId}' cannot be equipped in slot '${slotId}'`);

    // If there is already something equipped in this slot, return to inventory
    if (current.item) this.unequipItem(slotId);

    // Remove 1 inventory unit
    this.removeItem(itemId, 1);

    // Equip new piece (maintains only id and quantity = 1)
    current.item = { id: itemId, quantity: 1, metadata: item.metadata };
    this.specialSlots.set(slotId, current);
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
    if (!current) throw new Error(`Slot '${slotId}' not defined in registry.`);
    if (!current.item) return false; // Empty slot

    // Try to add back to inventory
    this.addItem(current.item.id, 1, null, current.item.metadata);

    // Remove from Special Slot
    current.item = null;
    this.specialSlots.set(slotId, current);
    return true;
  }

  /**
   * Returns all items currently stored in the inventory (across all sections if applicable),
   * excluding null or undefined entries.
   * @returns {InventoryItem[]} Array of item objects.
   */
  getAllItems() {
    /** @returns {(InventoryItem | null)[]} */
    const getItems = () => {
      if (this.useSections) {
        if (this.sections) return this.sections.flatMap((s) => Array.from(s.items));
      } else if (this.items) return Array.from(this.items);
      return [];
    };
    /**
     * Merge all sources and remove null/undefined
     * @type {InventoryItem[]}
     */
    const data = [...getItems()].filter(Boolean);
    this.specialSlots.forEach((value) => {
      const item = value.item;
      if (item) data.push(item);
    });
    return data;
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
   * Creates a plain JSON-safe object representing the current inventory state.
   * Functions (e.g., onUse) are NOT serialized; only instance state is saved.
   * @returns {SerializedInventory} A plain object safe to JSON.stringify.
   */
  toObject() {
    /** @type {Record<string, { type: string|null, item: InventoryItem|null }>} */
    const special = {};
    for (const [slotId, slotObj] of this.specialSlots.entries()) {
      special[slotId] = {
        type: slotObj?.type ?? null,
        item: slotObj?.item
          ? {
              id: slotObj.item.id,
              quantity: slotObj.item.quantity,
              metadata: slotObj.item.metadata ?? {},
            }
          : null,
      };
    }

    return {
      __schema: 'TinyInventory',
      version: 1,

      maxWeight: this.maxWeight,
      maxSlots: this.maxSlots,
      useSections: !!this.useSections,

      sections: this.sections
        ? this.sections.map((s) => ({
            id: s.id,
            slots: s.slots,
            items: Array.from(s.items).map((it) =>
              it
                ? {
                    id: it.id,
                    quantity: it.quantity,
                    metadata: it.metadata ?? {},
                  }
                : null,
            ),
          }))
        : null,

      items: this.items
        ? Array.from(this.items).map((it) =>
            it
              ? {
                  id: it.id,
                  quantity: it.quantity,
                  metadata: it.metadata ?? {},
                }
              : null,
          )
        : null,

      specialSlots: special,
    };
  }

  /**
   * Serializes the inventory to a JSON string.
   * @param {number} [space=0] - Pretty-print indentation (e.g., 2).
   * @returns {string} JSON string.
   */
  toJSON(space = 0) {
    return JSON.stringify(this.toObject(), null, space);
  }

  /**
   * Rebuilds a TinyInventory from a plain object created by {@link TinyInventory.toObject}.
   * Item definitions (ItemRegistry) must be already defined externally; this method only restores state.
   *
   * @param {SerializedInventory} obj - Parsed JSON object.
   * @param {Object} [options]
   * @param {boolean} [options.validate=true] - If true, validates item IDs against the registry.
   * @param {boolean} [options.enforceLimits=false] - If true, enforces weight/slot limits during load (may drop excess items).
   * @returns {TinyInventory} A new TinyInventory instance populated with the saved state.
   * @throws {Error} If validation fails and `validate` is true.
   */
  static fromObject(obj, options = {}) {
    const { validate = true, enforceLimits = false } = options;

    if (!obj || typeof obj !== 'object') {
      throw new Error('Invalid state: expected object.');
    }
    if (obj.__schema !== 'TinyInventory' || typeof obj.version !== 'number') {
      throw new Error('Invalid or missing schema header.');
    }
    if (obj.version !== 1) {
      throw new Error(`Unsupported TinyInventory state version: ${obj.version}`);
    }

    // Prepare constructor options
    /** @type {SectionCfg[]} */
    const sectionCfgs = Array.isArray(obj.sections)
      ? obj.sections.map((s) => ({ id: s.id, slots: s.slots, items: new Set() }))
      : [];

    /** @type {Record<string, {type: string|null}>} */
    const specialDefs = {};
    if (obj.specialSlots && typeof obj.specialSlots === 'object') {
      for (const key of Object.keys(obj.specialSlots)) {
        specialDefs[key] = { type: obj.specialSlots[key]?.type ?? null };
      }
    }

    const inv = new TinyInventory({
      maxWeight: obj.maxWeight ?? null,
      maxSlots: obj.maxSlots ?? null,
      useSections: !!obj.useSections,
      sections: sectionCfgs,
      specialSlots: specialDefs,
    });

    /**
     * Helper to validate item ID if required
     * @param {string} id
     */
    const ensureItemDef = (id) => {
      if (!validate) return;
      if (!TinyInventory.ItemRegistry.has(id)) {
        throw new Error(`Item '${id}' not defined in registry.`);
      }
    };

    // Restore items
    if (inv.useSections) {
      if (Array.isArray(obj.sections)) {
        obj.sections.forEach((s, idx) => {
          const target = inv.sections?.[idx];
          if (!target) return;
          const items = Array.isArray(s.items) ? s.items : [];
          for (const index in items) {
            const it = items[index];
            if (it !== null) {
              ensureItemDef(it.id);
              const safeItem = {
                id: String(it.id),
                quantity: Math.max(1, Number(it.quantity) || 1),
                metadata: it.metadata && typeof it.metadata === 'object' ? it.metadata : {},
              };
              if (enforceLimits) {
                // Respect limits during load by using addItem (which enforces rules)
                inv.setItem(Number(index), safeItem, target.id);
              } else {
                target.items.add(safeItem);
              }
            } else inv.setItem(Number(index), null, target.id);
          }
        });
      }
    } else if (Array.isArray(obj.items) && inv.items) {
      for (const index in obj.items) {
        const it = obj.items[index];
        if (it !== null) {
          ensureItemDef(it.id);
          const safeItem = {
            id: String(it.id),
            quantity: Math.max(1, Number(it.quantity) || 1),
            metadata: it.metadata && typeof it.metadata === 'object' ? it.metadata : {},
          };
          if (enforceLimits) {
            inv.setItem(Number(index), safeItem, null);
          } else {
            inv.items.add(safeItem);
          }
        } else inv.setItem(Number(index), null, null);
      }
    }

    // Restore special slots
    if (obj.specialSlots && typeof obj.specialSlots === 'object') {
      for (const [slotId, slotData] of Object.entries(obj.specialSlots)) {
        // Ensure slot exists (constructor already created it)
        if (!inv.specialSlots.has(slotId)) continue;

        const slot = inv.specialSlots.get(slotId);
        if (!slot) continue;
        // Keep the type from constructor; ignore type from payload if mismatched
        // but we still try to restore the item if present.
        const item = slotData?.item;
        if (item && item.id) {
          ensureItemDef(item.id);
          const safeEquipped = {
            id: String(item.id),
            quantity: Math.max(1, Number(item.quantity) || 1),
            metadata: item.metadata && typeof item.metadata === 'object' ? item.metadata : {},
          };

          if (enforceLimits) {
            // When enforcing limits, attempt to equip via method:
            // 1) Add to inventory, 2) Equip (will validate type), 3) Remove from inventory.
            inv.addItem(safeEquipped.id, safeEquipped.quantity, null, safeEquipped.metadata);
            try {
              inv.equipItem(slotId, safeEquipped.id);
            } catch {
              // If cannot equip, leave it in inventory
            }
          } else {
            slot.item = safeEquipped;
            inv.specialSlots.set(slotId, slot);
          }
        }
      }
    }

    return inv;
  }

  /**
   * Rebuilds a TinyInventory from a JSON string produced by {@link TinyInventory.toJSON}.
   * @param {string} json - JSON string.
   * @param {Object} [options] - See {@link TinyInventory.fromObject}.
   * @returns {TinyInventory} A new TinyInventory instance.
   */
  static fromJSON(json, options) {
    const obj = JSON.parse(json);
    return TinyInventory.fromObject(obj, options);
  }
}

export default TinyInventory;

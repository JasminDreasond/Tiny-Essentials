import TinyInventory from './TinyInventory.mjs';

/** @typedef {import('./TinyInventory.mjs').InventoryMetadata} InventoryMetadata */
/** @typedef {import('./TinyInventory.mjs').AddItemResult} AddItemResult */

/**
 * @typedef {Object} TransferItemCfg - Transfer configuration.
 * @property {number} [slotIndex] - Sender slot index (normal inventory).
 * @property {string} [specialSlot] - Sender special slot ID.
 * @property {number} [quantity=1] - Quantity to transfer.
 * @property {boolean} [forceSpace=false] - Whether to force addition even if space is limited.
 * @property {InventoryMetadata} [metadata={}] - Metadata to match items.
 */

/**
 * Class responsible for managing item transfers between two TinyInventory instances.
 */
class TinyInventoryTrader {
  /** @type {TinyInventory|null} */
  #sender = null;

  /** @type {TinyInventory|null} */
  #receiver = null;

  ///////////////////////////////////////////////

  /** @returns {TinyInventory|null} The currently connected sender inventory. */
  get sender() {
    return this.#sender;
  }

  /** @returns {TinyInventory|null} The currently connected receiver inventory. */
  get receiver() {
    return this.#receiver;
  }

  /** @param {TinyInventory} value Sets the sender inventory. */
  set sender(value) {
    if (!(value instanceof TinyInventory) || !(this.receiver instanceof TinyInventory))
      throw new Error('Both sender and receiver must be TinyInventory instances.');
    this.#sender = value;
  }

  /** @param {TinyInventory} value Sets the receiver inventory. */
  set receiver(value) {
    if (!(this.sender instanceof TinyInventory) || !(value instanceof TinyInventory))
      throw new Error('Both sender and receiver must be TinyInventory instances.');
    this.#receiver = value;
  }

  ///////////////////////////////////////////////

  /**
   * Manages item transfers between two TinyInventory instances.
   * @param {TinyInventory} [sender] - Inventory to remove items from.
   * @param {TinyInventory} [receiver] - Inventory to add items to.
   */
  constructor(sender, receiver) {
    if (sender || receiver) {
      if (!(sender instanceof TinyInventory) || !(receiver instanceof TinyInventory))
        throw new Error('Both sender and receiver must be TinyInventory instances.');
      this.connect(sender, receiver);
    }
  }

  /**
   * Connects the sender and receiver inventories for trading.
   * @param {TinyInventory} sender - Inventory to remove items from.
   * @param {TinyInventory} receiver - Inventory to add items to.
   */
  connect(sender, receiver) {
    if (!(sender instanceof TinyInventory) || !(receiver instanceof TinyInventory))
      throw new Error('Both sender and receiver must be TinyInventory instances.');
    this.#sender = sender;
    this.#receiver = receiver;
  }

  /**
   * Disconnects the sender and receiver inventories, preventing further transfers.
   */
  disconnect() {
    this.#sender = null;
    this.#receiver = null;
  }

  /**
   * Inverts the sender and receiver inventories.
   * Useful when performing bidirectional transfers.
   */
  invert() {
    const sender = this.#sender;
    const receiver = this.#receiver;
    this.#sender = receiver;
    this.#receiver = sender;
  }

  /**
   * Transfers an item from sender to receiver.
   *
   * @param {TransferItemCfg} options - Transfer configuration.
   * @returns {AddItemResult} Remaining quantity that could NOT be transferred.
   * @throws {Error} If sender or receiver is not connected, or item does not exist in sender.
   */
  transferItem({ slotIndex, specialSlot, quantity = 1, forceSpace = false, metadata = {} }) {
    if (!this.#sender || !this.#receiver)
      throw new Error('Sender and receiver inventories must be connected.');

    /**
     * @param {InventoryMetadata} a
     * @param {InventoryMetadata} b
     */
    const metadataEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    // Get the item from sender
    let item;
    if (specialSlot) {
      item = this.#sender.getSpecialItem(specialSlot);
      if (!item || !metadataEquals(item.metadata, metadata))
        throw new Error(`No item found in sender special slot '${specialSlot}'.`);
    } else if (typeof slotIndex === 'number') {
      item = this.#sender.getItemFrom(slotIndex);
      if (!item || !metadataEquals(item.metadata, metadata))
        throw new Error(`No item found in sender slot ${slotIndex}.`);
    } else throw new Error('Must provide either slotIndex or specialSlot.');

    // Match quantity
    if (item.quantity < quantity)
      throw new Error(`Sender does not have enough quantity of '${item.id}' to transfer.`);

    // Clone item for transfer
    const transferItem = {
      id: item.id,
      quantity,
      metadata: item.metadata,
    };

    const result = this.#receiver.addItem({
      itemId: transferItem.id,
      quantity: transferItem.quantity,
      metadata: transferItem.metadata,
      forceSpace,
    });

    // Remove successfully transferred quantity from sender
    const removedQty = transferItem.quantity - result.remaining;
    if (removedQty > 0) {
      if (specialSlot) {
        this.#sender.unequipItem({ slotId: specialSlot, quantity: removedQty, forceSpace });
      } else {
        this.#sender.removeItem({ itemId: item.id, quantity: removedQty, metadata });
      }
    }

    return result;
  }

  /**
   * Transfers multiple items at once.
   * @param {TransferItemCfg[]} items - Array of transfer configs (see transferItem options).
   * @returns {AddItemResult[]} Array of remaining quantities for each item.
   */
  transferMultiple(items) {
    return items.map((cfg) => this.transferItem(cfg));
  }
}

export default TinyInventoryTrader;

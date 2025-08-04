/**
 * @typedef {Object} KeyStatus
 * Describes the status of a key or button.
 * @property {boolean} pressed - Whether the key is currently pressed.
 * @property {number} [value] - Optional analog value associated with the key.
 * @property {number} [value2] - Optional second analog value.
 */

/**
 * @typedef {'gamepad-only' | 'keyboard-only' | 'both'} InputMode
 * Defines the available input modes.
 */

/** @typedef {(payload: InputPayload|InputAnalogPayload) => void} PayloadCallback Callback for handling input events. */

/** @typedef {(payload: ConnectionPayload) => void} ConnectionCallback Callback for handling gamepad connection events. */

/**
 * @typedef {Object} InputPayload
 * Structure for digital button input payload.
 * @property {string} type - Type of input event (down, up, hold).
 * @property {string} source - Input source (keyboard, mouse, gamepad).
 * @property {string} key - Physical input identifier.
 * @property {boolean} isPressure - Whether the input is pressure sensitive.
 * @property {string} logicalName - Logical name associated with the input.
 * @property {number} value - Primary analog value.
 * @property {number} value2 - Secondary analog value.
 * @property {boolean} pressed - Current pressed status.
 * @property {boolean|null} [prevPressed] - Previous pressed status.
 * @property {number} timestamp - Timestamp of the event.
 * @property {Gamepad} [gp] - Reference to the originating Gamepad.
 */

/**
 * @typedef {Object} InputAnalogPayload
 * Structure for analog input payload.
 * @property {string} type - Type of input event (change).
 * @property {string} source - Input source.
 * @property {string} key - Physical input identifier.
 * @property {string} logicalName - Logical name associated with the input.
 * @property {number} value - Analog value.
 * @property {number} value2 - Secondary analog value.
 * @property {number} timestamp - Timestamp of the event.
 * @property {Gamepad} [gp] - Reference to the originating Gamepad.
 */

/**
 * @typedef {Object} InputEvents
 * Internal structure for digital input events.
 * @property {string} key - Input key identifier.
 * @property {string} source - Source of the input.
 * @property {number} value - Value of the input.
 * @property {number} value2 - Secondary value.
 * @property {string} type - Type of input event.
 * @property {boolean} isPressure - Whether it is pressure-sensitive.
 * @property {boolean} pressed - Pressed status.
 * @property {boolean|null} [prevPressed] - Previous pressed status.
 * @property {number} timestamp - Timestamp of the event.
 * @property {Gamepad} [gp] - Reference to the gamepad.
 */

/**
 * @typedef {Object} InputAnalogEvents
 * Internal structure for analog input events.
 * @property {string} key - Analog key.
 * @property {string} source - Source of input.
 * @property {number} value - Main analog value.
 * @property {number} value2 - Secondary analog value.
 * @property {string} type - Type of event.
 * @property {number} timestamp - Timestamp.
 * @property {Gamepad} [gp] - Gamepad reference.
 */

/**
 * @typedef {Object} ConnectionPayload
 * Payload for connection-related events.
 * @property {string} id - ID of the gamepad.
 * @property {number} timestamp - Timestamp of the event.
 * @property {Gamepad} gp - Gamepad instance.
 */

/**
 * TinyGamepad is a high-level and extensible input management system
 * designed for professional-level control schemes in games or applications.
 *
 * It supports input from gamepads, keyboards, and optionally mouse devices.
 * Key features include:
 * - Input mapping from physical controls to logical action names
 * - Pressure-sensitive trigger and button support
 * - Dead zone configuration for analog inputs
 * - Event-based input handling (start, hold, end)
 * - Multiple logical names per input binding
 * - Unified control model for both digital and analog inputs
 *
 * TinyGamepad allows seamless integration of fallback control types,
 * detailed input feedback, and JSON-based profile serialization for saving and restoring mappings.
 */
class TinyGamepad {
  #isDestroyed = false;

  /** @type {Set<string>} */
  #heldKeys = new Set();

  /** @type {Map<string, string|string[]>} */
  #inputMap = new Map();

  /** @type {Map<string, (ConnectionCallback|PayloadCallback)[]>} */
  #callbacks = new Map();

  /** @type {null|Gamepad} */
  #connectedGamepad = null;

  /** @type {KeyStatus[]} */
  #lastButtonStates = [];

  /** @type {Record<string|number, KeyStatus>} */
  #lastKeyStates = {};

  /** @type {number[]} */
  #lastAxes = [];

  /** @type {null|number} */
  #animationFrame = null;

  /** @type {null|number} */
  #mouseKeyboardHoldLoop = null;

  /** @type {InputMode} */
  #inputMode;

  /** @type {Set<string>} */
  #ignoreIds;

  /** @type {number} */
  #deadZone;

  /** @type {string|null} */
  #expectedId;

  /** @type {boolean} */
  #allowMouse;

  /**
   * Initializes a new instance of TinyGamepad with customizable input behavior.
   *
   * This constructor allows configuring the expected device ID, the type of inputs to listen for
   * (keyboard, gamepad, or both), analog dead zone sensitivity, and whether to allow mouse input.
   * It also supports filtering out specific devices by ID.
   *
   * @param {Object} options - Configuration object for TinyGamepad behavior.
   * @param {string | null} [options.expectedId=null] - Specific controller ID to expect.
   * @param {InputMode} [options.inputMode='both'] - Mode of input to use.
   * @param {string[]} [options.ignoreIds=[]] - List of device IDs to ignore.
   * @param {number} [options.deadZone=0.1] - Analog stick dead zone threshold.
   * @param {boolean} [options.allowMouse=false] - Whether mouse events should be treated as input triggers.
   */
  constructor({
    expectedId = null,
    inputMode = 'both',
    ignoreIds = [],
    deadZone = 0.1,
    allowMouse = false,
  } = {}) {
    this.#expectedId = expectedId;
    this.#inputMode = inputMode;
    this.#ignoreIds = new Set(ignoreIds);
    this.#deadZone = deadZone;
    this.#allowMouse = allowMouse;

    if (['gamepad-only', 'both'].includes(this.#inputMode)) {
      this.#initGamepadEvents();
    }

    if (['keyboard-only', 'both'].includes(this.#inputMode)) {
      this.#initKeyboardMouse();
    }
  }

  //////////////////////////////////////////

  /** @type {(this: Window, ev: GamepadEvent) => any} */
  #gamepadConnected = (e) => this.#onGamepadConnect(e.gamepad);

  /** @type {(this: Window, ev: GamepadEvent) => any} */
  #gamepadDisconnected = (e) => this.#onGamepadDisconnect(e.gamepad);

  /**
   * Initializes listeners for gamepad connection and disconnection.
   * Automatically detects and handles supported gamepads.
   */
  #initGamepadEvents() {
    window.addEventListener('gamepadconnected', this.#gamepadConnected);
    window.addEventListener('gamepaddisconnected', this.#gamepadDisconnected);
  }

  /**
   * Internal callback when a gamepad is connected.
   * Starts polling and emits a "connected" event.
   * @param {Gamepad} gamepad
   */
  #onGamepadConnect(gamepad) {
    if (this.#ignoreIds.has(gamepad.id)) return;
    if (this.#expectedId && gamepad.id !== this.#expectedId) return;

    if (!this.#connectedGamepad) {
      this.#connectedGamepad = gamepad;
      this.#expectedId = gamepad.id;

      this.#startPolling();
      this.#emit('connected', { id: gamepad.id, gp: gamepad, timestamp: gamepad.timestamp });
    }
  }

  /**
   * Internal callback when a gamepad is disconnected.
   * Cancels polling and emits a "disconnected" event.
   * @param {Gamepad} gamepad
   */
  #onGamepadDisconnect(gamepad) {
    if (this.#connectedGamepad && gamepad.id === this.#connectedGamepad.id) {
      this.#connectedGamepad = null;
      if (this.#animationFrame) {
        cancelAnimationFrame(this.#animationFrame);
        this.#animationFrame = null;
      }
      this.#emit('disconnected', { id: gamepad.id, gp: gamepad, timestamp: gamepad.timestamp });
    }
  }

  /**
   * Starts the polling loop for tracking gamepad state.
   */
  #startPolling() {
    const loop = () => {
      if (this.#isDestroyed) return;
      this.#checkGamepadState();
      this.#animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * Compares and emits input changes from buttons and axes on the gamepad.
   */
  #checkGamepadState() {
    const pads = navigator.getGamepads();
    const gp = Array.from(pads).find((g) => g && g.id === this.#expectedId);
    if (!gp) return;

    this.#connectedGamepad = gp;

    gp.buttons.forEach((btn, index) => {
      const key = `Button${index}`;
      const prev = this.#lastButtonStates[index]?.pressed || false;

      const source = 'gamepad-button';
      let value;
      let type;
      let isPressure = false;
      if (btn.pressed && !prev) {
        value = 1;
        type = 'down';
      } else if (!btn.pressed && prev) {
        value = 0;
        type = 'up';
      } else if (btn.pressed && prev) {
        value = 1;
        type = 'hold';
      }

      if (btn.pressed && btn.value > 0 && btn.value < 1 && btn.value !== 1) {
        value = btn.value;
        isPressure = true;
      }

      if (typeof value === 'number' && typeof type === 'string')
        this.#handleInput({
          key,
          source,
          value,
          value2: NaN,
          type,
          gp,
          isPressure,
          pressed: btn.pressed,
          prevPressed: prev,
          timestamp: gp.timestamp,
        });
      this.#lastButtonStates[index] = { pressed: btn.pressed };
    });

    gp.axes.forEach((val, index) => {
      if (Math.abs(val) < this.#deadZone) val = 0;

      const key = `Axis${index}`;
      const prev = this.#lastAxes[index] ?? 0;
      if (val !== prev) {
        this.#handleInput({
          key,
          source: 'gamepad-analog',
          value: val,
          value2: NaN,
          type: 'change',
          timestamp: gp.timestamp,
          gp,
        });
      }
      this.#lastAxes[index] = val;
    });
  }

  ///////////////////////////////////

  /**
   * Listener for the 'keydown' event.
   * Triggers when a key is pressed and marks it as held.
   * Avoids duplicate presses while the key remains down.
   * Reports the input as a 'keyboard' source.
   *
   * @type {(this: Window, ev: KeyboardEvent) => any}
   */
  #keydown = (e) => {
    if (!this.#heldKeys.has(e.code)) {
      this.#heldKeys.add(e.code);
      this.#handleInput({
        key: e.code,
        source: 'keyboard',
        value: 1,
        value2: NaN,
        type: 'down',
        pressed: true,
        prevPressed: this.#lastKeyStates[e.code]?.pressed ?? false,
        timestamp: NaN,
      });
      this.#lastKeyStates[e.code] = { pressed: true };
    }
  };

  /**
   * Listener for the 'keyup' event.
   * Triggers when a key is released and removes it from the held list.
   * Reports the input as a 'keyboard' source.
   *
   * @type {(this: Window, ev: KeyboardEvent) => any}
   */
  #keyup = (e) => {
    if (this.#heldKeys.has(e.code)) {
      this.#heldKeys.delete(e.code);
      this.#handleInput({
        key: e.code,
        source: 'keyboard',
        value: 0,
        value2: NaN,
        type: 'up',
        pressed: false,
        prevPressed: this.#lastKeyStates[e.code]?.pressed ?? false,
        timestamp: NaN,
      });
      this.#lastKeyStates[e.code] = { pressed: false };
    }
  };

  /**
   * Listener for the 'mousedown' event.
   * Fires when a mouse button is pressed.
   * Identifies each button as 'Mouse<button>' and tracks its held state.
   *
   * @type {(this: Window, ev: MouseEvent) => any}
   */
  #mousedown = (e) => {
    const key = `Mouse${e.button}`;
    this.#heldKeys.add(key);
    this.#handleInput({
      key,
      source: 'mouse',
      value: 1,
      value2: NaN,
      type: 'down',
      pressed: true,
      prevPressed: this.#lastKeyStates[key]?.pressed ?? false,
      timestamp: NaN,
    });
    this.#lastKeyStates[key] = { pressed: true };
  };

  /**
   * Listener for the 'mouseup' event.
   * Fires when a mouse button is released.
   * Stops tracking the held state of the given button.
   *
   * @type {(this: Window, ev: MouseEvent) => any}
   */
  #mouseup = (e) => {
    const key = `Mouse${e.button}`;
    this.#heldKeys.delete(key);
    this.#handleInput({
      key,
      source: 'mouse',
      value: 0,
      value2: NaN,
      type: 'up',
      pressed: false,
      prevPressed: this.#lastKeyStates[key]?.pressed ?? false,
      timestamp: NaN,
    });
    this.#lastKeyStates[key] = { pressed: false };
  };

  /**
   * Listener for the 'mousemove' event.
   * Tracks relative movement of the mouse using movementX and movementY.
   * Used to simulate analog movement via mouse input.
   *
   * @type {(this: Window, ev: MouseEvent) => any}
   */
  #mousemove = (e) => {
    if (e.movementX !== 0 || e.movementY !== 0) {
      const key = 'MouseMove';
      /** @type {KeyStatus} */
      const old = this.#lastKeyStates[key] ?? { pressed: false, value: 0, value2: 0 };
      this.#handleInput({
        key,
        source: 'mouse',
        value: e.movementX + (old.value ?? 0),
        value2: e.movementY + (old.value ?? 0),
        type: 'move',
        pressed: true,
        prevPressed: null,
        timestamp: NaN,
      });
      this.#lastKeyStates[key] = { pressed: false, value: e.movementX, value2: e.movementY };
    }
  };

  /**
   * Initializes keyboard and mouse event listeners to emulate input behavior.
   */
  #initKeyboardMouse() {
    // Keyboard
    window.addEventListener('keydown', this.#keydown);
    window.addEventListener('keyup', this.#keyup);
    if (this.#allowMouse) {
      window.addEventListener('mousedown', this.#mousedown);
      window.addEventListener('mouseup', this.#mouseup);
      window.addEventListener('mousemove', this.#mousemove);
    }

    // Opcional: checagem contínua para "hold"
    const loop = () => {
      if (this.#isDestroyed) return;
      this.#heldKeys.forEach((key) => {
        this.#handleInput({
          key,
          source: !key.startsWith('Mouse') ? 'keyboard' : 'mouse',
          value: 1,
          value2: NaN,
          type: 'hold',
          pressed: true,
          prevPressed: this.#lastKeyStates[key]?.pressed ?? false,
          timestamp: NaN,
        });
      });
      this.#mouseKeyboardHoldLoop = requestAnimationFrame(loop);
    };
    loop();
  }

  //////////////////////////////////

  /**
   * Handles an input event by dispatching to registered listeners.
   * Supports wildcard and logical name-based callbacks.
   * @param {InputEvents|InputAnalogEvents} settings - Input event data.
   */
  #handleInput(settings) {
    /** @type {PayloadCallback[]} */
    // @ts-ignore
    const globalCbs = this.#callbacks.get('input-*') || [];
    for (const [logical, physical] of this.#inputMap.entries()) {
      const matches =
        physical === '*' ||
        physical === settings.key ||
        (Array.isArray(physical) && physical.includes(settings.key));

      if (!matches) continue;
      /** @type {PayloadCallback[]} */
      // @ts-ignore
      const cbs = this.#callbacks.get(`input-${logical}`) || [];
      if (cbs.length < 1) continue;
      /** @type {InputPayload|InputAnalogPayload} */
      const payload = { ...settings, logicalName: logical };
      for (const cb of globalCbs) cb(payload);
      for (const cb of cbs) cb(payload);

      // ➕ Separated events:
      const eventKey = `input${settings.type ? `-${settings.type}` : ''}-${logical}`;
      /** @type {PayloadCallback[]} */
      // @ts-ignore
      const typeCbs = this.#callbacks.get(eventKey) || [];
      for (const cb of typeCbs) cb(payload);
    }
  }

  /**
   * Assigns a physical input to a logical name (e.g., "Jump" => "Button1")
   * @param {string} logicalName
   * @param {string} physicalInput
   */
  mapInput(logicalName, physicalInput) {
    this.#inputMap.set(logicalName, physicalInput);
  }

  /**
   * Removes a logical input mapping
   * @param {string} logicalName
   */
  unmapInput(logicalName) {
    this.#inputMap.delete(logicalName);
  }

  /**
   * Checks if a logical name is mapped to any physical input.
   * @param {string} logicalName
   * @returns {boolean}
   */
  hasMappedInput(logicalName) {
    return this.#inputMap.has(logicalName);
  }

  /**
   * Returns a shallow clone of all logical-to-physical input mappings as a plain object.
   * @returns {{ [logicalName: string]: string | string[] }}
   */
  getClonedMappedInputs() {
    /** @type {{ [logicalName: string]: string | string[] }} */
    const result = {};
    for (const [logicalName, physicalInput] of this.#inputMap.entries()) {
      result[logicalName] = physicalInput;
    }
    return result;
  }

  /**
   * Returns the number of logical inputs currently mapped.
   * @returns {number}
   */
  getMappedInputCount() {
    return this.#inputMap.size;
  }

  /**
   * Clears all mappings for all logical inputs.
   */
  clearMapInputs() {
    this.#inputMap.clear();
  }

  /**
   * Registers a callback for a logical input
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onInput(logicalName, callback) {
    let callbacks = this.#callbacks.get(`input-${logicalName}`);
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set(`input-${logicalName}`, callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the input event list.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  prependInput(logicalName, callback) {
    const key = `input-${logicalName}`;
    const list = this.#callbacks.get(key) ?? [];
    list.unshift(callback);
    this.#callbacks.set(key, list);
  }

  /**
   * Removes a callback from a specific logical input event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  offInput(logicalName, callback) {
    const list = this.#callbacks.get(`input-${logicalName}`);
    if (Array.isArray(list)) {
      this.#callbacks.set(
        `input-${logicalName}`,
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Registers a callback for the "input-start" event of a logical name
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onInputStart(logicalName, callback) {
    let callbacks = this.#callbacks.get(`input-down-${logicalName}`);
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set(`input-down-${logicalName}`, callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the "input-start" event list.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  prependInputStart(logicalName, callback) {
    const key = `input-down-${logicalName}`;
    const list = this.#callbacks.get(key) ?? [];
    list.unshift(callback);
    this.#callbacks.set(key, list);
  }

  /**
   * Removes a callback from a specific logical "input-start" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  offInputStart(logicalName, callback) {
    const list = this.#callbacks.get(`input-down-${logicalName}`);
    if (Array.isArray(list)) {
      this.#callbacks.set(
        `input-down-${logicalName}`,
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Registers a callback for the "input-end" event of a logical name
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onInputEnd(logicalName, callback) {
    let callbacks = this.#callbacks.get(`input-up-${logicalName}`);
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set(`input-up-${logicalName}`, callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the "input-end" event list.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  prependInputEnd(logicalName, callback) {
    const key = `input-up-${logicalName}`;
    const list = this.#callbacks.get(key) ?? [];
    list.unshift(callback);
    this.#callbacks.set(key, list);
  }

  /**
   * Removes a callback from a specific logical "input-end" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  offInputEnd(logicalName, callback) {
    const list = this.#callbacks.get(`input-up-${logicalName}`);
    if (Array.isArray(list)) {
      this.#callbacks.set(
        `input-up-${logicalName}`,
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Registers a callback for the "input-hold" event of a logical name
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onInputHold(logicalName, callback) {
    let callbacks = this.#callbacks.get(`input-hold-${logicalName}`);
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set(`input-hold-${logicalName}`, callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the "input-hold" event list.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  prependInputHold(logicalName, callback) {
    const key = `input-hold-${logicalName}`;
    const list = this.#callbacks.get(key) ?? [];
    list.unshift(callback);
    this.#callbacks.set(key, list);
  }

  /**
   * Removes a callback from a specific logical "input-hold" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  offInputHold(logicalName, callback) {
    const list = this.#callbacks.get(`input-hold-${logicalName}`);
    if (Array.isArray(list)) {
      this.#callbacks.set(
        `input-hold-${logicalName}`,
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Returns a shallow clone of the callback list for a given logical input and event type.
   * @param {string} logicalName
   * @param {'all' | 'start' | 'end' | 'hold'} [type='all']
   * @returns {Function[]}
   */
  getClonedCallbacks(logicalName, type = 'all') {
    const prefix = {
      all: 'input-',
      start: 'input-down-',
      end: 'input-up-',
      hold: 'input-hold-',
    }[type];
    const key = `${prefix}${logicalName}`;
    const list = this.#callbacks.get(key);
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Removes all callbacks for a specific logical input event.
   * @param {string} logicalName
   * @param {'all'| 'start' | 'end' | 'hold'} [type='all']
   */
  offAllInputs(logicalName, type = 'all') {
    const prefix = {
      all: 'input-',
      start: 'input-down-',
      end: 'input-up-',
      hold: 'input-hold-',
    }[type];
    if (prefix) this.#callbacks.delete(`${prefix}${logicalName}`);
  }

  /**
   * Returns the number of registered callbacks for a specific logical input and type.
   * @param {string} logicalName
   * @param {'all' | 'start' | 'end' | 'hold'} [type='all']
   * @returns {number}
   */
  getCallbackSize(logicalName, type = 'all') {
    const prefix = {
      all: 'input-',
      start: 'input-down-',
      end: 'input-up-',
      hold: 'input-hold-',
    }[type];
    const list = this.#callbacks.get(`${prefix}${logicalName}`);
    return Array.isArray(list) ? list.length : 0;
  }

  /**
   * Returns the total number of unique event keys currently registered.
   * @returns {number}
   */
  getEventCount() {
    return this.#callbacks.size;
  }

  ////////////////////////////////////////////////

  /**
   * Default haptic effect settings
   */
  #defaultHapticEffect = {
    /** @type {GamepadHapticEffectType} */
    type: 'dual-rumble',
    /** @type {GamepadEffectParameters} */
    params: {
      startDelay: 0,
      duration: 200,
      weakMagnitude: 0.5,
      strongMagnitude: 1.0,
    },
  };

  /**
   * Sets the default haptic feedback effect configuration.
   * @param {GamepadHapticEffectType} type - Type of effect.
   * @param {GamepadEffectParameters} params - Effect parameters.
   */
  setDefaultHapticEffect(type, params) {
    this.#defaultHapticEffect.type = type;
    this.#defaultHapticEffect.params = params;
  }

  /**
   * Checks if the connected gamepad supports haptic feedback.
   * @returns {boolean}
   */
  hasHapticEffect() {
    const gp = this.#connectedGamepad;
    if (!gp) return false;
    const vibrationActuator = gp.vibrationActuator;
    if (!(vibrationActuator instanceof GamepadHapticActuator)) return false;
    return true;
  }

  /**
   * Triggers a haptic feedback vibration using provided or default settings.
   * @param {GamepadEffectParameters} [params] - Custom parameters.
   * @param {GamepadHapticEffectType} [type] - Custom type.
   * @returns {Promise<GamepadHapticsResult>}
   */
  vibrate(params, type) {
    const gp = this.#connectedGamepad;
    if (!gp) return new Promise((resolve) => resolve('complete'));
    const vibrationActuator = gp.vibrationActuator;
    if (!(vibrationActuator instanceof GamepadHapticActuator))
      return new Promise((resolve) => resolve('complete'));
    return vibrationActuator.playEffect(type ?? this.#defaultHapticEffect.type, {
      ...this.#defaultHapticEffect.params,
      ...params,
    });
  }

  ////////////////////////////////////////////

  /**
   * Adds an ID to the ignored list
   * @param {string} id
   */
  ignoreId(id) {
    this.#ignoreIds.add(id);
  }

  /**
   * Removes an ID from the ignored list
   * @param {string} id
   */
  unignoreId(id) {
    this.#ignoreIds.delete(id);
  }

  /**
   * Registers a callback for the "connected" event
   * @param {ConnectionCallback} callback
   */
  onConnected(callback) {
    let callbacks = this.#callbacks.get('connected');
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set('connected', callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the "connected" event.
   * @param {ConnectionCallback} callback
   */
  prependConnected(callback) {
    /** @type {ConnectionCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('connected') ?? [];
    list.unshift(callback);
    this.#callbacks.set('connected', list);
  }

  /**
   * Removes a callback from the "connected" event.
   * @param {ConnectionCallback} callback
   */
  offConnected(callback) {
    const list = this.#callbacks.get('connected');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'connected',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "connected" event.
   */
  offAllConnected() {
    this.#callbacks.delete('connected');
  }

  /**
   * Returns a cloned list of the "connected" event callbacks.
   * @returns {ConnectionCallback[]}
   */
  getClonedConnectedCallbacks() {
    /** @type {ConnectionCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('connected');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "connected" event.
   * @returns {number}
   */
  getConnectedCallbackSize() {
    const list = this.#callbacks.get('connected');
    return Array.isArray(list) ? list.length : 0;
  }

  /**
   * Registers a callback for the "disconnected" event
   * @param {ConnectionCallback} callback
   */
  onDisconnected(callback) {
    let callbacks = this.#callbacks.get('disconnected');
    if (!Array.isArray(callbacks)) {
      callbacks = [];
      this.#callbacks.set('disconnected', callbacks);
    }
    callbacks.push(callback);
  }

  /**
   * Prepends a callback to the "disconnected" event.
   * @param {ConnectionCallback} callback
   */
  prependDisconnected(callback) {
    const list = this.#callbacks.get('disconnected') ?? [];
    list.unshift(callback);
    this.#callbacks.set('disconnected', list);
  }

  /**
   * Removes a callback from the "disconnected" event.
   * @param {ConnectionCallback} callback
   */
  offDisconnected(callback) {
    const list = this.#callbacks.get('disconnected');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'disconnected',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "disconnected" event.
   */
  offAllDisconnected() {
    this.#callbacks.delete('disconnected');
  }

  /**
   * Returns a cloned list of the "disconnected" event callbacks.
   * @returns {ConnectionCallback[]}
   */
  getClonedDisconnectedCallbacks() {
    /** @type {ConnectionCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('disconnected');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "disconnected" event.
   * @returns {number}
   */
  getDisconnectedCallbackSize() {
    const list = this.#callbacks.get('disconnected');
    return Array.isArray(list) ? list.length : 0;
  }

  /**
   * Emits a custom internal event to all listeners.
   * @param {string} event - Event name.
   * @param {*} data - Payload data.
   */
  #emit(event, data) {
    const cbs = this.#callbacks.get(event) || [];
    for (const cb of cbs) cb(data);
  }

  //////////////////////////////////////////

  /**
   * Returns whether a gamepad is currently connected.
   * @returns {boolean}
   */
  hasGamepad() {
    return this.#connectedGamepad instanceof Gamepad;
  }

  /**
   * Returns the currently connected Gamepad instance.
   * Throws if no gamepad is connected.
   * @returns {Gamepad}
   */
  getGamepad() {
    if (!this.#connectedGamepad) throw new Error('');
    return this.#connectedGamepad;
  }

  //////////////////////////////////////////

  /**
   * Exports the current configuration as a JSON string
   * @param {number} [spaces=2]
   * @returns {string}
   */
  exportConfig(spaces = 2) {
    return JSON.stringify(
      {
        expectedId: this.#expectedId,
        ignoreIds: Array.from(this.#ignoreIds),
        deadZone: this.#deadZone,
        inputMap: Array.from(this.#inputMap.entries()),
      },
      null,
      spaces,
    );
  }

  /**
   * Imports a JSON configuration and applies it
   * @param {string|Object} json
   */
  importConfig(json) {
    const config = typeof json === 'string' ? JSON.parse(json) : json;

    if (config.expectedId) this.#expectedId = config.expectedId;
    if (Array.isArray(config.ignoreIds)) this.#ignoreIds = new Set(config.ignoreIds);
    if (typeof config.deadZone === 'number') this.#deadZone = config.deadZone;
    if (Array.isArray(config.#inputMap)) {
      this.#inputMap = new Map(config.#inputMap);
    }
  }

  ////////////////////////////////////

  /**
   * Returns whether the instance has been destroyed
   * @returns {boolean}
   */
  isDestroyed() {
    return this.#isDestroyed;
  }

  /**
   * Clears internal state and stops any ongoing input monitoring or loops.
   * Marks the instance as destroyed.
   */
  destroy() {
    if (this.#isDestroyed) return;
    this.#isDestroyed = true;

    if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame);
    if (this.#mouseKeyboardHoldLoop) cancelAnimationFrame(this.#mouseKeyboardHoldLoop);
    this.#animationFrame = null;
    this.#mouseKeyboardHoldLoop = null;

    if (['keyboard-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('keydown', this.#keydown);
      window.removeEventListener('keyup', this.#keyup);
      if (this.#allowMouse) {
        window.removeEventListener('mousedown', this.#mousedown);
        window.removeEventListener('mouseup', this.#mouseup);
        window.removeEventListener('mousemove', this.#mousemove);
      }
    }

    if (['gamepad-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('gamepadconnected', this.#gamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.#gamepadDisconnected);
    }

    this.#inputMap.clear();
    this.#callbacks.clear();
    this.#heldKeys.clear();
    this.#ignoreIds.clear();
    this.#lastButtonStates = [];
    this.#lastAxes = [];
  }
}

export default TinyGamepad;

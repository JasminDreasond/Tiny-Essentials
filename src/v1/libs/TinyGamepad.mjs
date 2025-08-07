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

/**
 * A callback function that is invoked when a mapped logical input is activated or deactivated.
 *
 * This function receives the logical name associated with the input (e.g., "Jump", "Shoot", "Menu")
 * and can be used to handle input-related actions such as triggering game mechanics or UI behavior.
 *
 * @typedef {(payload: { logicalName: string, activeTime: number, comboTime: number }) => void} MappedInputCallback
 */

/**
 * A callback function that is invoked when a mapped key is activated or deactivated.
 *
 * This function receives the key name associated with the input (e.g., "KeyA", "KeyB", "KeyC")
 * and can be used to handle input-related actions such as triggering game mechanics or UI behavior.
 *
 * @typedef {(payload: { key: string, activeTime: number }) => void} MappedKeyCallback
 */

/**
 * @typedef {(payload: InputPayload|InputAnalogPayload) => void} PayloadCallback
 * Callback for handling input events.
 */

/**
 * @typedef {(payload: ConnectionPayload) => void} ConnectionCallback
 * Callback for handling gamepad connection events.
 */

/**
 * A callback function that is triggered when a registered input sequence is fully activated.
 *
 * @callback InputSequenceCallback
 * @param {number} timestamp - The moment in milliseconds when the sequence was successfully detected.
 */

/**
 * A callback function that is triggered when a registered key sequence is fully activated.
 *
 * @callback KeySequenceCallback
 * @param {number} timestamp - The moment in milliseconds when the sequence was successfully detected.
 */

/**
 * Represents a specific input source from a gamepad.
 * - 'gamepad-analog' refers to analog sticks or analog triggers.
 * - 'gamepad-button' refers to digital buttons on the gamepad.
 * @typedef {'gamepad-analog'|'gamepad-button'} GamepadDeviceSource
 */

/**
 * Represents any possible physical device source that can be used for input.
 * - 'mouse': Input from a mouse.
 * - 'keyboard': Input from a keyboard.
 * - 'gamepad-analog': Analog input from a gamepad (e.g., sticks, triggers).
 * - 'gamepad-button': Digital button input from a gamepad.
 * @typedef {'mouse'|'keyboard'|GamepadDeviceSource} DeviceSource
 */

/**
 * Represents the type of input interaction detected.
 * - 'up': Input was released.
 * - 'down': Input was pressed.
 * - 'hold': Input is being held.
 * - 'change': Input value changed (e.g., pressure or axis).
 * - 'move': Analog movement detected (e.g., joystick motion).
 * @typedef {'up'|'down'|'hold'|'change'|'move'} DeviceInputType
 */

/**
 * @typedef {Object} InputPayload
 * Structure for digital button input payload.
 * @property {DeviceInputType} type - Type of input event (down, up, hold).
 * @property {DeviceSource} source - Input source (keyboard, mouse, gamepad).
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
 * @property {DeviceInputType} type - Type of input event (change).
 * @property {DeviceSource} source - Input source.
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
 * @property {DeviceSource} source - Source of the input.
 * @property {number} value - Value of the input.
 * @property {number} value2 - Secondary value.
 * @property {DeviceInputType} type - Type of input event.
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
 * @property {DeviceSource} source - Source of input.
 * @property {number} value - Main analog value.
 * @property {number} value2 - Secondary analog value.
 * @property {DeviceInputType} type - Type of event.
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
  /** @type {boolean} Indicates whether this instance has been destroyed and is no longer usable. */
  #isDestroyed = false;

  /** @type {Set<string>} Currently held physical key/input identifiers. */
  #heldKeys = new Set();

  /** @type {Map<string, string|string[]>} Maps logical input names to one or more physical input identifiers. */
  #inputMap = new Map();

  /**
   * @type {Map<string, (ConnectionCallback|PayloadCallback|MappedInputCallback|MappedKeyCallback)[]>}
   * Stores all event callback arrays for different input-related events.
   */
  #callbacks = new Map();

  /** @type {null|Gamepad} Holds the currently connected Gamepad instance, or null if none is connected. */
  #connectedGamepad = null;

  /** @type {KeyStatus[]} Stores the previous button states for the connected gamepad to detect changes. */
  #lastButtonStates = [];

  /** @type {Record<string|number, KeyStatus>} Tracks the previous state of each key or button (keyboard/mouse/gamepad). */
  #lastKeyStates = {};

  /** @type {number[]} Stores the last known values of all gamepad analog axes. */
  #lastAxes = [];

  /** @type {null|number} Holds the requestAnimationFrame ID for the gamepad update loop. */
  #animationFrame = null;

  /** @type {null|number} Holds the setInterval ID for keyboard and mouse hold tracking. */
  #mouseKeyboardHoldLoop = null;

  /** @type {InputMode} Defines the current input mode (keyboard, gamepad, or both). */
  #inputMode;

  /** @type {Set<string>} A list of controller IDs to ignore during gamepad scanning. */
  #ignoreIds;

  /** @type {number} Dead zone threshold for analog stick sensitivity. */
  #deadZone;

  /** @type {string|null} The expected gamepad ID (if filtering by specific controller model). */
  #expectedId;

  /** @type {boolean} Whether mouse inputs are accepted and mapped like other inputs. */
  #allowMouse;

  /** @type {Window|Element} The element or window that receives input events (keyboard/mouse). */
  #elementBase;

  /**
   * @type {number}
   * Time in milliseconds before resetting a combination of mapped inputs (used for sequences like fighting game combos).
   */
  #timeoutComboInputs;

  /**
   * @type {number}
   * Time in milliseconds before resetting a combination of raw keys (used for basic key sequences).
   */
  #timeoutComboKeys;

  /**
   * Axis movement threshold to consider an axis active combo.
   * Value range: 0 (most sensitive) to 1 (least sensitive).
   * @type {number}
   */
  #axisActiveSensitivity;

  /** @type {string[]} Temporarily holds the current sequence of mapped inputs being pressed. */
  #comboInputs = [];

  /** @type {number} Timestamp of the last mapped input combo trigger. */
  #timeComboInputs = 0;

  /** @type {NodeJS.Timeout|null} Timer for auto-resetting the mapped input combo sequence. */
  #intervalComboInputs = null;

  /** @type {number} Timestamp of the last mapped input. */
  #timeMappedInputs = 0;

  /** @type {string[]} Temporarily holds the current sequence of raw keys being pressed. */
  #comboKeys = [];

  /** @type {number} Timestamp of the last key combo trigger. */
  #timeComboKeys = 0;

  /** @type {NodeJS.Timeout|null} Timer for auto-resetting the raw key combo sequence. */
  #intervalComboKeys = null;

  /**
   * @type {Set<string>}
   * Set of currently active logical keys (used to track which mapped actions are being held).
   */
  #activeMappedKeys = new Set();

  /**
   * @type {Set<string>}
   * Set of currently active logical inputs (used to track which mapped actions are being held).
   */
  #activeMappedInputs = new Set();

  /**
   * @type {Map<string, { sequence: string[], callback: InputSequenceCallback, triggered: boolean }>}
   * Stores all registered logical input sequences and their associated callbacks.
   */
  #inputSequences = new Map();

  /**
   * @type {Map<string, { sequence: string[], callback: KeySequenceCallback, triggered: boolean }>}
   * Stores all registered raw key sequences and their associated callbacks.
   */
  #keySequences = new Map();

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
   * @param {number} [options.timeoutComboInputs=500] - Maximum time (in milliseconds) allowed between inputs in a combo sequence before the reset time.
   * @param {number} [options.timeoutComboKeys=500] - Maximum time (in milliseconds) allowed between inputs in a key sequence before the reset time.
   * @param {number} [options.axisActiveSensitivity=0.3] - Threshold to detect meaningful axis movement (0 = most sensitive, 1 = least sensitive).
   * @param {Window|Element} [options.elementBase=window] - The DOM element or window to bind keyboard and mouse events to.
   */
  constructor({
    expectedId = null,
    inputMode = 'both',
    ignoreIds = [],
    deadZone = 0.1,
    axisActiveSensitivity = 0.3,
    timeoutComboInputs = 500,
    timeoutComboKeys = 500,
    allowMouse = false,
    elementBase = window,
  } = {}) {
    this.#expectedId = expectedId;
    this.#inputMode = inputMode;
    this.#ignoreIds = new Set(ignoreIds);
    this.#deadZone = deadZone;
    this.#allowMouse = allowMouse;
    this.#elementBase = elementBase;
    this.#timeoutComboInputs = timeoutComboInputs;
    this.#timeoutComboKeys = timeoutComboKeys;
    this.#axisActiveSensitivity = axisActiveSensitivity;

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
    if (this.#isDestroyed) return;
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
    if (this.#isDestroyed) return;
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
    if (this.#isDestroyed) return;
    const pads = navigator.getGamepads();
    const gp = Array.from(pads).find((g) => g && g.id === this.#expectedId);
    if (!gp) return;

    this.#connectedGamepad = gp;

    gp.buttons.forEach((btn, index) => {
      const key = `Button${index}`;
      const prev = this.#lastButtonStates[index]?.pressed || false;

      /** @type {DeviceInputType} */
      let type;

      const source = 'gamepad-button';
      let value;
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

      // @ts-ignore
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
   * @type {EventListener}
   */
  #keydown = (e) => {
    if (this.#isDestroyed) return;
    if (!(e instanceof KeyboardEvent))
      throw new Error('Expected KeyboardEvent in keydown listener.');
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
   * @type {EventListener}
   */
  #keyup = (e) => {
    if (this.#isDestroyed) return;
    if (!(e instanceof KeyboardEvent)) throw new Error('Expected KeyboardEvent in keyup listener.');
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
   * @type {EventListener}
   */
  #mousedown = (e) => {
    if (this.#isDestroyed) return;
    if (!(e instanceof MouseEvent)) throw new Error('Expected MouseEvent in mousedown listener.');
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
   * @type {EventListener}
   */
  #mouseup = (e) => {
    if (this.#isDestroyed) return;
    if (!(e instanceof MouseEvent)) throw new Error('Expected MouseEvent in mouseup listener.');
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
   * @type {EventListener}
   */
  #mousemove = (e) => {
    if (this.#isDestroyed) return;
    if (!(e instanceof MouseEvent)) throw new Error('Expected MouseEvent in mousemove listener.');
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
    this.#elementBase.addEventListener('keydown', this.#keydown);
    this.#elementBase.addEventListener('keyup', this.#keyup);
    if (this.#allowMouse) {
      this.#elementBase.addEventListener('mousedown', this.#mousedown);
      this.#elementBase.addEventListener('mouseup', this.#mouseup);
      this.#elementBase.addEventListener('mousemove', this.#mousemove);
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
    if (this.#isDestroyed) return;
    /** @type {PayloadCallback[]} */
    // @ts-ignore
    const globalCbs = this.#callbacks.get('input-*') || [];
    // @ts-ignore
    const { pressed, key } = settings;
    const isAxis = key.startsWith('Axis');
    const isPressed =
      (typeof pressed === 'boolean' && pressed) ||
      (isAxis &&
        (settings.value > this.#axisActiveSensitivity ||
          settings.value < -Math.abs(this.#axisActiveSensitivity)));

    const activeKey = !isAxis
      ? key
      : `${key}${settings.value > 0 ? '+' : settings.value < 0 ? '-' : ''}`;

    // Key Map
    if (settings.type !== 'move' && settings.type !== 'hold') {
      if (isPressed) {
        if (
          // Normal
          (!isAxis && !this.#activeMappedKeys.has(key)) ||
          // Axis
          (isAxis &&
            !this.#activeMappedKeys.has(key) &&
            !this.#activeMappedKeys.has(`${key}+`) &&
            !this.#activeMappedKeys.has(`${key}-`))
        ) {
          if (this.#timeComboKeys === 0) this.#timeComboKeys = Date.now();
          this.#activeMappedKeys.add(activeKey);

          if (this.#intervalComboKeys) clearTimeout(this.#intervalComboKeys);
          this.#comboKeys.push(activeKey);
          this.#intervalComboKeys = setTimeout(
            () => this.resetComboMappedKeys(),
            this.#timeoutComboKeys,
          );

          /** @type {MappedKeyCallback[]} */
          // @ts-ignore
          const cbs = this.#callbacks.get('mapped-key-start') ?? [];
          for (const cb of cbs)
            cb({
              key: activeKey,
              activeTime: this.#timeComboKeys,
            });
        }
      } else {
        if (
          // Normal
          (!isAxis && this.#activeMappedKeys.has(key)) ||
          // Axis
          (isAxis &&
            (this.#activeMappedKeys.has(key) ||
              this.#activeMappedKeys.has(`${key}+`) ||
              this.#activeMappedKeys.has(`${key}-`)))
        ) {
          this.#activeMappedKeys.delete(key);
          this.#activeMappedKeys.delete(`${key}+`);
          this.#activeMappedKeys.delete(`${key}-`);
          /** @type {MappedKeyCallback[]} */
          // @ts-ignore
          const cbs = this.#callbacks.get('mapped-key-end') ?? [];
          for (const cb of cbs)
            cb({
              key: activeKey,
              activeTime: this.#timeComboKeys,
            });
        }
      }

      // Check sequences
      for (const { sequence, callback, triggered } of this.#keySequences.values()) {
        const keySequence = this.#keySequences.get(sequence.join('+'));
        if (!keySequence) continue;
        // Execute sequences
        const allPressed = sequence.every((name, index) => this.#comboKeys[index] === name);
        if (allPressed && !triggered) {
          keySequence.triggered = true;
          callback(this.#timeComboKeys);
        } else if (!allPressed && triggered) {
          keySequence.triggered = false;
        }
      }
    }

    // Input Map
    for (const [logical, physical] of this.#inputMap.entries()) {
      const activeLogical = !isAxis
        ? logical
        : `${logical}${settings.value > 0 ? '+' : settings.value < 0 ? '-' : ''}`;

      // Active Mapped inputs script
      if (
        (typeof physical === 'string' && activeKey === physical) ||
        (Array.isArray(physical) &&
          physical.findIndex((value, i) => activeKey === physical[i]) > -1)
      ) {
        // Manage input list
        if (isPressed) {
          if (!this.#activeMappedInputs.has(logical)) {
            if (this.#timeMappedInputs === 0) this.#timeMappedInputs = Date.now();
            this.#activeMappedInputs.add(logical);

            if (this.#timeComboInputs === 0) this.#timeComboInputs = Date.now();
            if (this.#intervalComboInputs) clearTimeout(this.#intervalComboInputs);
            this.#comboInputs.push(logical);
            this.#intervalComboInputs = setTimeout(
              () => this.resetComboMappedInputs(),
              this.#timeoutComboInputs,
            );

            /** @type {MappedInputCallback[]} */
            // @ts-ignore
            const cbs = this.#callbacks.get('mapped-input-start') ?? [];
            for (const cb of cbs)
              cb({
                logicalName: logical,
                activeTime: this.#timeMappedInputs,
                comboTime: this.#timeComboInputs,
              });
          }
        } else {
          if (this.#activeMappedInputs.has(logical)) {
            this.#activeMappedInputs.delete(logical);
            if (this.#activeMappedInputs.size < 1) this.#timeMappedInputs = 0;
            /** @type {MappedInputCallback[]} */
            // @ts-ignore
            const cbs = this.#callbacks.get('mapped-input-end') ?? [];
            for (const cb of cbs)
              cb({
                logicalName: logical,
                activeTime: this.#timeMappedInputs,
                comboTime: this.#timeComboInputs,
              });
          }
        }

        // Check sequences
        for (const { sequence, callback, triggered } of this.#inputSequences.values()) {
          const inputSequence = this.#inputSequences.get(sequence.join('+'));
          if (!inputSequence) continue;
          // Execute sequences
          const activeSequence = Array.from(this.#activeMappedInputs);
          const allPressed = sequence.every((name, index) => activeSequence[index] === name);
          if (allPressed && !triggered) {
            inputSequence.triggered = true;
            callback(this.#timeMappedInputs);
          } else if (!allPressed && triggered) {
            inputSequence.triggered = false;
          }
        }
      }

      // Match Checker
      const matches =
        physical === '*' ||
        physical === key ||
        (Array.isArray(physical) && physical.includes(settings.key));

      if (!matches) continue;

      // Prepare callbacks
      /** @type {PayloadCallback[]} */
      // @ts-ignore
      const typeCbs = this.#callbacks.get(`input-${settings.type}-${activeLogical}`) || [];

      /** @type {PayloadCallback[]} */
      // @ts-ignore
      const cbs = this.#callbacks.get(`input-${activeLogical}`) || [];

      // Check callbacks
      if (cbs.length < 1 && typeCbs.length < 1 && globalCbs.length < 1) continue;

      // Send payloads
      /** @type {InputPayload|InputAnalogPayload} */
      const payload = { ...settings, logicalName: activeLogical };
      for (const cb of globalCbs) cb(payload);
      for (const cb of cbs) cb(payload);

      // ➕ Separated events:
      for (const cb of typeCbs) cb(payload);
    }
  }

  ///////////////////////////////////////////////////

  /**
   * Waits for a single input event from the user and resolves with detailed input information.
   * This is typically used in control configuration screens to allow the user to choose an input
   * (keyboard, mouse, or gamepad) that will be mapped to a logical action.
   *
   * The function listens for the first eligible input (ignores 'MouseMove') and returns the key,
   * input source, and the Gamepad object if applicable. If no input is received before the timeout,
   * the promise resolves with a `null` key and source.
   *
   * @param {object} [options] - Optional configuration for input capture behavior.
   * @param {number} [options.timeout=10000] - Timeout in milliseconds before the promise resolves automatically with null values.
   * @param {string} [options.eventName='MappingInput'] - The temporary logical event name used internally to listen for input.
   * @returns {Promise<{ key: string | null, source: DeviceSource | null, gp?: Gamepad }>}
   * A promise that resolves with an object containing:
   *   - `key`: the identifier of the pressed input (e.g., "KeyW", "Button0", "LeftClick"),
   *   - `source`: the origin of the input ("keyboard", "mouse", "gamepad-button", or "gamepad-analog"),
   *   - `gp`: the Gamepad object (only if the input source is a gamepad).
   */
  awaitInputMapping({ timeout = 10000, eventName = 'MappingInput' } = {}) {
    return new Promise((resolve) => {
      /** @type {{ key: string|null; source: DeviceSource|null; gp?: Gamepad; }} */
      const result = { key: null, source: null };

      /** @type {PayloadCallback} */
      const inputCallback = ({ key, type, source, gp }) => {
        if (type === 'move') return;
        result.key = key;
        result.source = source;
        result.gp = gp;
        clearTimeout(timer);
        this.offInputStart(eventName, inputCallback);
        resolve(result);
      };

      // Time limit to auto-cancel input collection
      const timer = setTimeout(() => resolve(result), timeout);

      this.mapInput(eventName, '*');
      this.onInputStart(eventName, inputCallback);
    });
  }

  /**
   * Assigns a physical input to a logical name (e.g., "Jump" => "Button1")
   * @param {string} logicalName
   * @param {string|string[]} physicalInput
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

  //////////////////////////////////////////////////////////////

  /**
   * Registers a sequence of logical inputs that triggers a specific callback.
   * @param {string[]} sequence - Ordered list of logical input names (e.g., ['Jump', 'Action'])
   * @param {InputSequenceCallback} callback - Function to invoke when the sequence is fully held
   */
  registerInputSequence(sequence, callback) {
    const key = sequence.join('+');
    this.#inputSequences.set(key, { sequence, callback, triggered: false });
  }

  /**
   * Unregisters a previously registered input sequence.
   * @param {string[]} sequence - The sequence to remove from detection
   */
  unregisterInputSequence(sequence) {
    const key = sequence.join('+');
    this.#inputSequences.delete(key);
  }

  /**
   * Removes all registered input sequences.
   */
  unregisterAllInputSequences() {
    this.#inputSequences.clear();
  }

  /**
   * Checks whether a given input sequence is currently registered.
   * @param {string[]} sequence - The sequence to check
   * @returns {boolean}
   */
  hasInputSequence(sequence) {
    const key = sequence.join('+');
    return this.#inputSequences.has(key);
  }

  /**
   * Returns the number of input sequences currently registered.
   * @returns {number}
   */
  getInputSequenceCount() {
    return this.#inputSequences.size;
  }

  /**
   * Returns a shallow clone of all input sequences and their associated data.
   * @returns {InputSequenceCallback[]}
   */
  getClonedInputSequences() {
    const result = [];
    for (const [, data] of this.#inputSequences.entries()) result.push(data.callback);
    return result;
  }

  /**
   * Returns a clone of currently held mapped logical inputs.
   * @returns {string[]}
   */
  getActiveMappedInputs() {
    return [...this.#activeMappedInputs];
  }

  ////////////////////////////////////////////////////////

  /**
   * Registers a sequence of logical inputs that triggers a specific callback.
   * @param {string[]} sequence - Ordered list of logical input names (e.g., ['Jump', 'Action'])
   * @param {InputSequenceCallback} callback - Function to invoke when the sequence is fully held
   */
  registerKeySequence(sequence, callback) {
    const key = sequence.join('+');
    this.#keySequences.set(key, { sequence, callback, triggered: false });
  }

  /**
   * Unregisters a previously registered input sequence.
   * @param {string[]} sequence - The sequence to remove from detection
   */
  unregisterKeySequence(sequence) {
    const key = sequence.join('+');
    this.#keySequences.delete(key);
  }

  /**
   * Removes all registered input sequences.
   */
  unregisterAllKeySequences() {
    this.#keySequences.clear();
  }

  /**
   * Checks whether a given input sequence is currently registered.
   * @param {string[]} sequence - The sequence to check
   * @returns {boolean}
   */
  hasKeySequence(sequence) {
    const key = sequence.join('+');
    return this.#keySequences.has(key);
  }

  /**
   * Returns the number of input sequences currently registered.
   * @returns {number}
   */
  getKeySequenceCount() {
    return this.#keySequences.size;
  }

  /**
   * Returns a shallow clone of all input sequences and their associated data.
   * @returns {InputSequenceCallback[]}
   */
  getClonedKeySequences() {
    const result = [];
    for (const [, data] of this.#keySequences.entries()) result.push(data.callback);
    return result;
  }

  /**
   * Returns a clone of currently held mapped logical keys.
   * @returns {string[]}
   */
  getActiveMappedKeys() {
    return [...this.#activeMappedKeys];
  }

  ////////////////////////////////////////////////////////

  /**
   * Resets the currently held key combo logical inputs.
   */
  resetComboMappedKeys() {
    if (this.#intervalComboKeys) clearTimeout(this.#intervalComboKeys);
    this.#comboKeys = [];
    this.#intervalComboKeys = null;
    this.#timeComboKeys = 0;
  }

  /**
   * Returns a clone of currently held key combo logical inputs.
   * @returns {string[]}
   */
  getComboMappedKeys() {
    return [...this.#comboKeys];
  }

  /////////////////////////////////////////////////////////////////

  /**
   * Registers a callback for when a mapped key is activated (pressed down)
   * @param {MappedInputCallback} callback
   */
  onMappedKeyStart(callback) {
    let list = this.#callbacks.get('mapped-key-start');
    if (!Array.isArray(list)) {
      list = [];
      this.#callbacks.set('mapped-key-start', list);
    }
    list.push(callback);
  }

  /**
   * Registers a one-time callback for the "mapped-key-start" event.
   * The callback will be automatically removed after it runs once.
   * @param {MappedInputCallback} callback
   */
  onceMappedKeyStart(callback) {
    /** @type {MappedInputCallback} */
    const wrapper = (logicalName) => {
      this.offMappedInputStart(wrapper);
      callback(logicalName);
    };
    this.onMappedInputStart(wrapper);
  }

  /**
   * Prepends a callback to the "mapped-key-start" event.
   * @param {MappedInputCallback} callback
   */
  prependMappedKeyStart(callback) {
    const list = this.#callbacks.get('mapped-key-start') ?? [];
    list.unshift(callback);
    this.#callbacks.set('mapped-key-start', list);
  }

  /**
   * Removes a callback from the "mapped-key-start" event.
   * @param {MappedInputCallback} callback
   */
  offMappedKeyStart(callback) {
    const list = this.#callbacks.get('mapped-key-start');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'mapped-key-start',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "mapped-key-start" event.
   */
  offAllMappedKeyStart() {
    this.#callbacks.delete('mapped-key-start');
  }

  /**
   * Returns a cloned list of the "mapped-key-start" event callbacks.
   * @returns {MappedInputCallback[]}
   */
  getClonedMappedKeyStartCallbacks() {
    /** @type {MappedInputCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('mapped-key-start');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "mapped-key-start" event.
   * @returns {number}
   */
  getMappedKeyStartCallbackSize() {
    const list = this.#callbacks.get('mapped-key-start');
    return Array.isArray(list) ? list.length : 0;
  }

  //////////////////////////////////////////////////////////////////

  /**
   * Registers a callback for when a mapped key is deactivated (released)
   * @param {MappedInputCallback} callback
   */
  onMappedKeyEnd(callback) {
    let list = this.#callbacks.get('mapped-key-end');
    if (!Array.isArray(list)) {
      list = [];
      this.#callbacks.set('mapped-key-end', list);
    }
    list.push(callback);
  }

  /**
   * Registers a one-time callback for the "mapped-key-end" event.
   * The callback will be automatically removed after it runs once.
   * @param {MappedInputCallback} callback
   */
  onceMappedKeyEnd(callback) {
    /** @type {MappedInputCallback} */
    const wrapper = (logicalName) => {
      this.offMappedInputEnd(wrapper);
      callback(logicalName);
    };
    this.onMappedInputEnd(wrapper);
  }

  /**
   * Prepends a callback to the "mapped-key-end" event.
   * @param {MappedInputCallback} callback
   */
  prependMappedKeyEnd(callback) {
    const list = this.#callbacks.get('mapped-key-end') ?? [];
    list.unshift(callback);
    this.#callbacks.set('mapped-key-end', list);
  }

  /**
   * Removes a callback from the "mapped-key-end" event.
   * @param {MappedInputCallback} callback
   */
  offMappedKeyEnd(callback) {
    const list = this.#callbacks.get('mapped-key-end');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'mapped-key-end',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "mapped-key-end" event.
   */
  offAllMappedKeyEnd() {
    this.#callbacks.delete('mapped-key-end');
  }

  /**
   * Returns a cloned list of the "mapped-key-end" event callbacks.
   * @returns {MappedInputCallback[]}
   */
  getClonedMappedKeyEndCallbacks() {
    /** @type {MappedInputCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('mapped-key-end');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "mapped-key-end" event.
   * @returns {number}
   */
  getMappedKeyEndCallbackSize() {
    const list = this.#callbacks.get('mapped-key-end');
    return Array.isArray(list) ? list.length : 0;
  }

  ////////////////////////////////////////////////////////

  /**
   * Resets the currently held combo logical inputs.
   */
  resetComboMappedInputs() {
    if (this.#intervalComboInputs) clearTimeout(this.#intervalComboInputs);
    this.#comboInputs = [];
    this.#intervalComboInputs = null;
    this.#timeComboInputs = 0;
  }

  /**
   * Returns a clone of currently held combo logical inputs.
   * @returns {string[]}
   */
  getComboMappedInputs() {
    return [...this.#comboInputs];
  }

  /////////////////////////////////////////////////////////////////

  /**
   * Registers a callback for when a mapped input is activated (pressed down)
   * @param {MappedInputCallback} callback
   */
  onMappedInputStart(callback) {
    let list = this.#callbacks.get('mapped-input-start');
    if (!Array.isArray(list)) {
      list = [];
      this.#callbacks.set('mapped-input-start', list);
    }
    list.push(callback);
  }

  /**
   * Registers a one-time callback for the "mapped-input-start" event.
   * The callback will be automatically removed after it runs once.
   * @param {MappedInputCallback} callback
   */
  onceMappedInputStart(callback) {
    /** @type {MappedInputCallback} */
    const wrapper = (logicalName) => {
      this.offMappedInputStart(wrapper);
      callback(logicalName);
    };
    this.onMappedInputStart(wrapper);
  }

  /**
   * Prepends a callback to the "mapped-input-start" event.
   * @param {MappedInputCallback} callback
   */
  prependMappedInputStart(callback) {
    const list = this.#callbacks.get('mapped-input-start') ?? [];
    list.unshift(callback);
    this.#callbacks.set('mapped-input-start', list);
  }

  /**
   * Removes a callback from the "mapped-input-start" event.
   * @param {MappedInputCallback} callback
   */
  offMappedInputStart(callback) {
    const list = this.#callbacks.get('mapped-input-start');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'mapped-input-start',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "mapped-input-start" event.
   */
  offAllMappedInputStart() {
    this.#callbacks.delete('mapped-input-start');
  }

  /**
   * Returns a cloned list of the "mapped-input-start" event callbacks.
   * @returns {MappedInputCallback[]}
   */
  getClonedMappedInputStartCallbacks() {
    /** @type {MappedInputCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('mapped-input-start');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "mapped-input-start" event.
   * @returns {number}
   */
  getMappedInputStartCallbackSize() {
    const list = this.#callbacks.get('mapped-input-start');
    return Array.isArray(list) ? list.length : 0;
  }

  //////////////////////////////////////////////////////////////////

  /**
   * Registers a callback for when a mapped input is deactivated (released)
   * @param {MappedInputCallback} callback
   */
  onMappedInputEnd(callback) {
    let list = this.#callbacks.get('mapped-input-end');
    if (!Array.isArray(list)) {
      list = [];
      this.#callbacks.set('mapped-input-end', list);
    }
    list.push(callback);
  }

  /**
   * Registers a one-time callback for the "mapped-input-end" event.
   * The callback will be automatically removed after it runs once.
   * @param {MappedInputCallback} callback
   */
  onceMappedInputEnd(callback) {
    /** @type {MappedInputCallback} */
    const wrapper = (logicalName) => {
      this.offMappedInputEnd(wrapper);
      callback(logicalName);
    };
    this.onMappedInputEnd(wrapper);
  }

  /**
   * Prepends a callback to the "mapped-input-end" event.
   * @param {MappedInputCallback} callback
   */
  prependMappedInputEnd(callback) {
    const list = this.#callbacks.get('mapped-input-end') ?? [];
    list.unshift(callback);
    this.#callbacks.set('mapped-input-end', list);
  }

  /**
   * Removes a callback from the "mapped-input-end" event.
   * @param {MappedInputCallback} callback
   */
  offMappedInputEnd(callback) {
    const list = this.#callbacks.get('mapped-input-end');
    if (Array.isArray(list)) {
      this.#callbacks.set(
        'mapped-input-end',
        list.filter((cb) => cb !== callback),
      );
    }
  }

  /**
   * Removes all callbacks from the "mapped-input-end" event.
   */
  offAllMappedInputEnd() {
    this.#callbacks.delete('mapped-input-end');
  }

  /**
   * Returns a cloned list of the "mapped-input-end" event callbacks.
   * @returns {MappedInputCallback[]}
   */
  getClonedMappedInputEndCallbacks() {
    /** @type {MappedInputCallback[]} */
    // @ts-ignore
    const list = this.#callbacks.get('mapped-input-end');
    return Array.isArray(list) ? [...list] : [];
  }

  /**
   * Returns the number of callbacks registered for the "mapped-input-end" event.
   * @returns {number}
   */
  getMappedInputEndCallbackSize() {
    const list = this.#callbacks.get('mapped-input-end');
    return Array.isArray(list) ? list.length : 0;
  }

  /////////////////////////////////////////////////////////////

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
   * Registers a one-time callback for a logical input.
   * The callback is removed after the first invocation.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onceInput(logicalName, callback) {
    /** @type {PayloadCallback} */
    const wrapper = (payload) => {
      this.offInput(logicalName, wrapper);
      callback(payload);
    };
    this.onInput(logicalName, wrapper);
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

  /////////////////////////////////////////////////////////

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
   * Registers a one-time callback for the "input-start" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onceInputStart(logicalName, callback) {
    /** @type {PayloadCallback} */
    const wrapper = (payload) => {
      this.offInputStart(logicalName, wrapper);
      callback(payload);
    };
    this.onInputStart(logicalName, wrapper);
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

  /////////////////////////////////////////////////////////////////////////

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
   * Registers a one-time callback for the "input-end" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onceInputEnd(logicalName, callback) {
    /** @type {PayloadCallback} */
    const wrapper = (payload) => {
      this.offInputEnd(logicalName, wrapper);
      callback(payload);
    };
    this.onInputEnd(logicalName, wrapper);
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

  ///////////////////////////////////////////////////////////////////

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
   * Registers a one-time callback for the "input-hold" event.
   * @param {string} logicalName
   * @param {PayloadCallback} callback
   */
  onceInputHold(logicalName, callback) {
    /** @type {PayloadCallback} */
    const wrapper = (payload) => {
      this.offInputHold(logicalName, wrapper);
      callback(payload);
    };
    this.onInputHold(logicalName, wrapper);
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

  ////////////////////////////////////////////////////////////

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
   * Registers a one-time callback for the "connected" event.
   * The callback will be automatically removed after it runs once.
   * @param {ConnectionCallback} callback
   */
  onceConnected(callback) {
    /** @type {ConnectionCallback} */
    const wrapper = (device) => {
      this.offConnected(wrapper);
      callback(device);
    };
    this.onConnected(wrapper);
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
   * Registers a one-time callback for the "disconnected" event.
   * The callback will be automatically removed after it runs once.
   * @param {ConnectionCallback} callback
   */
  onceDisconnected(callback) {
    /** @type {ConnectionCallback} */
    const wrapper = (device) => {
      this.offDisconnected(wrapper);
      callback(device);
    };
    this.onDisconnected(wrapper);
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
    if (!this.#connectedGamepad) throw new Error('No gamepad is currently connected.');
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
   * Returns a shallow clone of the set of ignored device IDs.
   * @returns {string[]}
   */
  getIgnoredDeviceIds() {
    return [...this.#ignoreIds];
  }

  /**
   * Returns a shallow clone of the currently held keys.
   * @returns {string[]}
   */
  getHeldKeys() {
    return [...this.#heldKeys];
  }

  ////////////////////////////////////

  /**
   * Returns the expected device ID, or null if any is accepted.
   * @returns {string|null}
   */
  get expectedId() {
    return this.#expectedId;
  }

  /**
   * Returns the current input mode (e.g., 'keyboard', 'gamepad', or 'both').
   * @returns {InputMode}
   */
  get inputMode() {
    return this.#inputMode;
  }

  /**
   * Returns the base element or window used for event binding.
   * @returns {Window|Element}
   */
  get elementBase() {
    return this.#elementBase;
  }

  /**
   * Returns the timestamp of the last mapped input combo.
   * @returns {number}
   */
  get timeComboInputs() {
    return this.#timeComboInputs;
  }

  /**
   * Returns the timestamp of the last raw key combo.
   * @returns {number}
   */
  get timeComboKeys() {
    return this.#timeComboKeys;
  }

  /**
   * Returns the timestamp of the last mapped input activity.
   * @returns {number}
   */
  get timeMappedInputs() {
    return this.#timeMappedInputs;
  }

  /**
   * Returns the timeout duration (in milliseconds) before mapped input combos are reset.
   * @returns {number}
   */
  get timeoutComboInputs() {
    return this.#timeoutComboInputs;
  }

  /**
   * Returns the timeout duration (in milliseconds) before raw key combos are reset.
   * @returns {number}
   */
  get timeoutComboKeys() {
    return this.#timeoutComboKeys;
  }

  /**
   * Gets the sensitivity threshold used to detect when an axis (like a thumbstick or trigger)
   * is considered "actively moved". This helps distinguish minor noise from intentional input.
   *
   * A value of 0 means even the slightest movement is detected; a value closer to 1 means only strong input is accepted.
   *
   * @returns {number} The current axis activity sensitivity (between 0 and 1).
   */
  get axisActiveSensitivity() {
    return this.#axisActiveSensitivity;
  }

  /**
   * Sets the sensitivity threshold used to detect active axis input.
   * This value defines how far an analog axis (such as a thumbstick or trigger) must move from its rest position
   * before being considered as a valid input.
   *
   * Values must be between 0 and 1. An error is thrown if the value is outside this range or not a number.
   *
   * @param {number} value - The new sensitivity value between 0 and 1.
   */
  set axisActiveSensitivity(value) {
    if (typeof value !== 'number' || value < 0 || value > 1)
      throw new RangeError('Axis sensitivity must be a number between 0 and 1.');
    this.#axisActiveSensitivity = value;
  }

  /**
   * Returns the current dead zone threshold for analog inputs.
   * @returns {number}
   */
  get deadZone() {
    return this.#deadZone;
  }

  /**
   * Sets a new dead zone threshold for analog inputs.
   * Must be a number between 0 and 1.
   * @param {number} value
   */
  set deadZone(value) {
    if (typeof value !== 'number' || value < 0 || value > 1)
      throw new RangeError('Dead zone must be a number between 0 and 1.');
    this.#deadZone = value;
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
      this.#elementBase.removeEventListener('keydown', this.#keydown);
      this.#elementBase.removeEventListener('keyup', this.#keyup);
      if (this.#allowMouse) {
        this.#elementBase.removeEventListener('mousedown', this.#mousedown);
        this.#elementBase.removeEventListener('mouseup', this.#mouseup);
        this.#elementBase.removeEventListener('mousemove', this.#mousemove);
      }
    }

    if (['gamepad-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('gamepadconnected', this.#gamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.#gamepadDisconnected);
    }

    this.resetComboMappedInputs();
    this.resetComboMappedKeys();
    this.#inputMap.clear();
    this.#callbacks.clear();
    this.#heldKeys.clear();
    this.#activeMappedInputs.clear();
    this.#activeMappedKeys.clear();
    this.#inputSequences.clear();
    this.#keySequences.clear();
    this.#ignoreIds.clear();
    this.#lastButtonStates = [];
    this.#lastAxes = [];
    this.#lastKeyStates = {};
    this.#connectedGamepad = null;
    this.#expectedId = null;
    this.#allowMouse = false;
    this.#timeMappedInputs = 0;
  }
}

export default TinyGamepad;

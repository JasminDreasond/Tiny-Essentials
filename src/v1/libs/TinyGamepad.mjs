/**
 * @typedef {Object} KeyStatus
 * @property {boolean} pressed
 * @property {number} [value]
 * @property {number} [value2]
 */

/**
 * @typedef {'gamepad-only' | 'keyboard-only' | 'both'} InputMode
 */

/** @typedef {(payload: InputPayload|InputAnalogPayload) => void} PayloadCallback */

/** @typedef {(payload: ConnectionPayload) => void} ConnectionCallback */

/**
 * @typedef {Object} InputPayload
 * @property {string} type
 * @property {string} source
 * @property {string} key
 * @property {boolean} isPressure
 * @property {string} logicalName
 * @property {number} value
 * @property {number} value2
 * @property {boolean} pressed
 * @property {boolean|null} [prevPressed]
 * @property {number} timestamp
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputAnalogPayload
 * @property {string} type
 * @property {string} source
 * @property {string} key
 * @property {string} logicalName
 * @property {number} value
 * @property {number} value2
 * @property {number} timestamp
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputEvents
 * @property {string} key
 * @property {string} source
 * @property {number} value
 * @property {number} value2
 * @property {string} type
 * @property {boolean} isPressure
 * @property {boolean} pressed
 * @property {boolean|null} [prevPressed]
 * @property {number} timestamp
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputAnalogEvents
 * @property {string} key
 * @property {string} source
 * @property {number} value
 * @property {number} value2
 * @property {string} type
 * @property {number} timestamp
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} ConnectionPayload
 * @property {string} id
 * @property {number} timestamp
 * @property {Gamepad} gp
 */

class TinyGamepad {
  #isDestroyed = false;

  #heldKeys = new Set();

  /** @type {Map<string, string|string[]>} */
  #inputMap = new Map();

  /** @type {Map<string, Function[]>} */
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

  /**
   * @param {Object} options
   * @param {string|null} [options.expectedId=null] ID exata do controle esperado
   * @param {InputMode} [options.inputMode='both']
   * @param {string[]} [options.ignoreIds=[]] Lista de IDs a ignorar
   * @param {number} [options.deadZone=0.1] Zona morta para os analógicos
   */
  constructor({ expectedId = null, inputMode = 'both', ignoreIds = [], deadZone = 0.1 } = {}) {
    this.#expectedId = expectedId;
    this.#inputMode = inputMode;
    this.#ignoreIds = new Set(ignoreIds);
    this.#deadZone = deadZone;

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

  #initGamepadEvents() {
    window.addEventListener('gamepadconnected', this.#gamepadConnected);
    window.addEventListener('gamepaddisconnected', this.#gamepadDisconnected);
  }

  /** @param {Gamepad} gamepad */
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

  /** @param {Gamepad} gamepad */
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

  #startPolling() {
    const loop = () => {
      if (this.#isDestroyed) return;
      this.#checkGamepadState();
      this.#animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  #checkGamepadState() {
    const pads = navigator.getGamepads();
    const gp = Array.from(pads).find((g) => g && g.id === this.#expectedId);
    if (!gp) return;

    this.#connectedGamepad = gp;

    gp.buttons.forEach((btn, index) => {
      const key = `button${index}`;
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

      const key = `axis${index}`;
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

  /** @type {(this: Window, ev: KeyboardEvent) => any} */
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

  /** @type {(this: Window, ev: KeyboardEvent) => any} */
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

  /** @type {(this: Window, ev: MouseEvent) => any} */
  #mousedown = (e) => {
    const key = `mouse-${e.button}`;
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

  /** @type {(this: Window, ev: MouseEvent) => any} */
  #mouseup = (e) => {
    const key = `mouse-${e.button}`;
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

  /** @type {(this: Window, ev: MouseEvent) => any} */
  #mousemove = (e) => {
    if (e.movementX !== 0 || e.movementY !== 0) {
      const key = 'mouse-move';
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

  #initKeyboardMouse() {
    // Keyboard
    window.addEventListener('keydown', this.#keydown);
    window.addEventListener('keyup', this.#keyup);
    window.addEventListener('mousedown', this.#mousedown);
    window.addEventListener('mouseup', this.#mouseup);
    window.addEventListener('mousemove', this.#mousemove);

    // Opcional: checagem contínua para "hold"
    const loop = () => {
      if (this.#isDestroyed) return;
      this.#heldKeys.forEach((data, key) => {
        this.#handleInput({
          key,
          source: !key.startsWith('mouse-') ? 'keyboard' : 'mouse',
          value: 1,
          value2: NaN,
          type: 'hold',
          pressed: true,
          prevPressed: data.pressed,
          timestamp: NaN,
        });
      });
      this.#mouseKeyboardHoldLoop = requestAnimationFrame(loop);
    };
    loop();
  }

  //////////////////////////////////

  /**
   * @param {InputEvents|InputAnalogEvents} settings
   */
  #handleInput(settings) {
    const globalCbs = this.#callbacks.get('input-*') || [];
    for (const [logical, physical] of this.#inputMap.entries()) {
      const matches =
        physical === '*' ||
        physical === settings.key ||
        (Array.isArray(physical) && physical.includes(settings.key));

      if (!matches) continue;
      const cbs = this.#callbacks.get(`input-${logical}`) || [];
      if (cbs.length < 1) continue;
      /** @type {InputPayload|InputAnalogPayload} */
      const payload = { ...settings, logicalName: logical };
      for (const cb of globalCbs) cb(payload);
      for (const cb of cbs) cb(payload);

      // ➕ Separated events:
      const eventKey = `input${settings.type ? `-${settings.type}` : ''}-${logical}`;
      const typeCbs = this.#callbacks.get(eventKey) || [];
      for (const cb of typeCbs) cb(payload);
    }
  }

  /**
   * Atribui uma entrada a um nome lógico (ex: "Jump" => "button1")
   * @param {string} logicalName
   * @param {string} physicalInput
   */
  mapInput(logicalName, physicalInput) {
    this.#inputMap.set(logicalName, physicalInput);
  }

  /**
   * Remove uma entrada lógica
   * @param {string} logicalName
   */
  unmapInput(logicalName) {
    this.#inputMap.delete(logicalName);
  }

  /**
   * Registra um callback para um input lógico
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
   * Registra um callback para o evento "input-start" de um nome lógico
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
   * Registra um callback para o evento "input-end" de um nome lógico
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
   * Registra um callback para o evento "input-hold" de um nome lógico
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

  ////////////////////////////////////////////////

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
   * @param {GamepadHapticEffectType} type
   * @param {GamepadEffectParameters} params
   */
  setDefaultHapticEffect(type, params) {
    this.#defaultHapticEffect.type = type;
    this.#defaultHapticEffect.params = params;
  }

  /**
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
   * @param {GamepadEffectParameters} [params]
   * @param {GamepadHapticEffectType} [type]
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
   * Adiciona uma ID à lista de ignoradas
   * @param {string} id
   */
  ignoreId(id) {
    this.#ignoreIds.add(id);
  }

  /**
   * Remove uma ID da lista de ignoradas
   * @param {string} id
   */
  unignoreId(id) {
    this.#ignoreIds.delete(id);
  }

  /**
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
   * @param {string} event
   * @param {*} data
   */
  #emit(event, data) {
    const cbs = this.#callbacks.get(event) || [];
    for (const cb of cbs) cb(data);
  }

  //////////////////////////////////////////

  /**
   * @returns {boolean}
   */
  hasGamepad() {
    return this.#connectedGamepad instanceof Gamepad;
  }

  /**
   * @returns {Gamepad}
   */
  getGamepad() {
    if (!this.#connectedGamepad) throw new Error('');
    return this.#connectedGamepad;
  }

  //////////////////////////////////////////

  /**
   * Exporta a configuração atual como JSON
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
   * Importa uma configuração JSON e aplica
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
   *  @returns {boolean}
   */
  isDestroyed() {
    return this.#isDestroyed;
  }

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
      window.removeEventListener('mousedown', this.#mousedown);
      window.removeEventListener('mouseup', this.#mouseup);
      window.removeEventListener('mousemove', this.#mousemove);
    }

    if (['gamepad-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('gamepadconnected', this.#gamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.#gamepadDisconnected);
    }
  }
}

export default TinyGamepad;

/**
 * @typedef {{ pressed: boolean }} KeyStatus
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
 * @property {boolean} pressed
 * @property {boolean} prevPressed
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputAnalogPayload
 * @property {string} type
 * @property {string} source
 * @property {string} key
 * @property {string} logicalName
 * @property {number} value
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputEvents
 * @property {string} key
 * @property {string} source
 * @property {number} value
 * @property {string} type
 * @property {boolean} isPressure
 * @property {boolean} pressed
 * @property {boolean} prevPressed
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} InputAnalogEvents
 * @property {string} key
 * @property {string} source
 * @property {number} value
 * @property {string} type
 * @property {Gamepad} [gp]
 */

/**
 * @typedef {Object} ConnectionPayload
 * @property {string} id
 * @property {Gamepad} gp
 */

class TinyGamepad {
  #heldKeys = new Set();

  #inputMap = new Map(); // ex: "Jump" => "button1"

  /** @type {Map<string, Function[]>} */
  #callbacks = new Map(); // ex: "Jump" => [fn1, fn2]

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
      this.#emit('connected', { id: gamepad.id, gp: gamepad });
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
      this.#emit('disconnected', { id: gamepad.id, gp: gamepad });
    }
  }

  #startPolling() {
    const loop = () => {
      this.#checkGamepadState();
      this.#animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  ///////////////////////////////////////

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
          type,
          gp,
          isPressure,
          pressed: btn.pressed,
          prevPressed: prev,
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
          type: 'change',
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
        type: 'down',
        pressed: true,
        prevPressed: this.#lastKeyStates[e.code]?.pressed ?? false,
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
        type: 'up',
        pressed: false,
        prevPressed: this.#lastKeyStates[e.code]?.pressed ?? false,
      });
      this.#lastKeyStates[e.code] = { pressed: false };
    }
  };

  #initKeyboardMouse() {
    // Keyboard
    window.addEventListener('keydown', this.#keydown);
    window.addEventListener('keyup', this.#keyup);

    // Opcional: checagem contínua para "hold"
    const loop = () => {
      this.#heldKeys.forEach((data, key) => {
        this.#handleInput({
          key,
          source: 'keyboard',
          value: 1,
          type: 'hold',
          pressed: true,
          prevPressed: data.pressed,
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
      if (physical === '*' || physical === settings.key) {
        const cbs = this.#callbacks.get(`input-${logical}`) || [];
        if (cbs.length < 1) continue;
        /** @type {InputPayload|InputAnalogPayload} */
        const payload = { ...settings, logicalName: logical };
        for (const cb of globalCbs) cb(payload);
        for (const cb of cbs) cb(payload);
      }
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

  ////////////////////////////////////////////////

  vibrate(duration = 200, weakMagnitude = 0.5, strongMagnitude = 1.0) {
    const gp = this.#connectedGamepad;
    if (!gp?.vibrationActuator) return false;

    return gp.vibrationActuator.playEffect('dual-rumble', {
      duration,
      startDelay: 0,
      weakMagnitude,
      strongMagnitude,
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

  destroy() {
    if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame);
    if (this.#mouseKeyboardHoldLoop) cancelAnimationFrame(this.#mouseKeyboardHoldLoop);
    this.#animationFrame = null;
    this.#mouseKeyboardHoldLoop = null;

    if (['keyboard-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('keydown', this.#keydown);
      window.removeEventListener('keyup', this.#keyup);
    }

    if (['gamepad-only', 'both'].includes(this.#inputMode)) {
      window.removeEventListener('gamepadconnected', this.#gamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.#gamepadDisconnected);
    }
  }
}

export default TinyGamepad;

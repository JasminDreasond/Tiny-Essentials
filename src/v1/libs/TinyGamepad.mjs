/**
 * @typedef {{ pressed: boolean }} keyStatus
 */

class TinyGamepad {
  #heldKeys = new Set();

  #inputMap = new Map(); // ex: "Jump" => "button1"
  #callbacks = new Map(); // ex: "Jump" => [fn1, fn2]

  /** @type {null|Gamepad} */
  #connectedGamepad = null;

  /** @type {keyStatus[]} */
  #lastButtonStates = [];

  /** @type {Record<string|number, keyStatus>} */
  #lastKeyStates = {};

  /** @type {number[]} */
  #lastAxes = [];

  /** @type {null|number} */
  #animationFrame = null;

  /** @type {null|number} */
  #mouseKeyboardHoldLoop = null;

  /** @type {boolean} */
  #useKeyboardMouse;

  /** @type {Set<string>} */
  #ignoreIds;

  /** @type {number} */
  #deadZone;

  /**
   * @param {Object} options
   * @param {string|null} [options.expectedId=null] ID exata do controle esperado
   * @param {boolean} [options.useKeyboardMouse=false] Se usar teclado/mouse em vez do gamepad
   * @param {string[]} [options.ignoreIds=[]] Lista de IDs a ignorar
   * @param {number} [options.deadZone=0.1] Zona morta para os analógicos
   */
  constructor({
    expectedId = null,
    useKeyboardMouse = false,
    ignoreIds = [],
    deadZone = 0.1,
  } = {}) {
    this.expectedId = expectedId;
    this.#useKeyboardMouse = useKeyboardMouse;
    this.#ignoreIds = new Set(ignoreIds);
    this.#deadZone = deadZone;

    if (this.#useKeyboardMouse) {
      this.#initKeyboardMouse();
    } else {
      this.#initGamepadEvents();
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
    if (this.expectedId && gamepad.id !== this.expectedId) return;

    if (!this.#connectedGamepad) {
      this.#connectedGamepad = gamepad;
      this.expectedId = gamepad.id;

      this.#startPolling();
      this._emit('connected', { id: gamepad.id });
    }
  }

  /** @param {Gamepad} gamepad */
  #onGamepadDisconnect(gamepad) {
    if (this.#connectedGamepad && gamepad.id === this.#connectedGamepad.id) {
      this.#connectedGamepad = null;
      if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame);
      this._emit('disconnected', { id: gamepad.id });
    }
  }

  #startPolling() {
    const loop = () => {
      this.#checkGamepadState();
      if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  ///////////////////////////////////////

  #checkGamepadState() {
    const pads = navigator.getGamepads();
    const gp = Array.from(pads).find((g) => g && g.id === this.expectedId);
    if (!gp) return;

    this.#connectedGamepad = gp;

    gp.buttons.forEach((btn, index) => {
      const key = `button${index}`;
      const prev = this.#lastButtonStates[index]?.pressed || false;

      const source = 'gamepad-button';
      let value;
      let type;
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

      if (typeof value === 'number' && typeof type === 'string')
        this.#handleInput({
          key,
          source,
          value,
          type,
          gp,
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
        prevPressed: this.#lastKeyStates[e.code],
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
        prevPressed: this.#lastKeyStates[e.code],
      });
      this.#lastKeyStates[e.code] = { pressed: false };
    }
  };

  #initKeyboardMouse() {
    // Keyboard
    window.addEventListener('keydown', this.#keydown);
    window.addEventListener('keyup', this.#keyup);

    // Opcional: checagem contínua para "hold"
    this.#mouseKeyboardHoldLoop = requestAnimationFrame(() => {
      for (const key of this.#heldKeys) {
        this.#handleInput({
          key,
          source: 'keyboard',
          value: 1,
          type: 'hold',
          pressed: true,
          prevPressed: this.#lastKeyStates[key],
        });
        this.#lastKeyStates[key] = { pressed: true };
      }
    });
  }

  //////////////////////////////////

  #handleInput({ key, source, value, type, gp, pressed, prevPressed } = {}) {
    const globalCbs = this.#callbacks.get('*') || [];
    for (const [logical, physical] of this.#inputMap.entries()) {
      if (physical === '*' || physical === key) {
        const cbs = this.#callbacks.get(logical) || [];
        if (cbs.length < 1) continue;
        const payload = {
          type,
          source,
          key,
          logicalName: logical,
          value,
          pressed,
          prevPressed,
          gp,
        };
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
   */
  onInput(logicalName, callback) {
    if (!this.#callbacks.has(logicalName)) {
      this.#callbacks.set(logicalName, []);
    }
    this.#callbacks.get(logicalName).push(callback);
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
   * Eventos genéricos como conectado/desconectado
   */
  on(event, callback) {
    if (!this.#callbacks.has(event)) {
      this.#callbacks.set(event, []);
    }
    this.#callbacks.get(event).push(callback);
  }

  _emit(event, data) {
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
   * @returns {string}
   */
  exportConfig() {
    return JSON.stringify(
      {
        expectedId: this.expectedId,
        ignoreIds: Array.from(this.#ignoreIds),
        deadZone: this.#deadZone,
        inputMap: Array.from(this.#inputMap.entries()),
      },
      null,
      2,
    );
  }

  /**
   * Importa uma configuração JSON e aplica
   * @param {string|Object} json
   */
  importConfig(json) {
    const config = typeof json === 'string' ? JSON.parse(json) : json;

    if (config.expectedId) this.expectedId = config.expectedId;
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

    if (this.#useKeyboardMouse) {
      window.removeEventListener('keydown', this.#keydown);
      window.removeEventListener('keyup', this.#keyup);
    } else {
      window.removeEventListener('gamepadconnected', this.#gamepadConnected);
      window.removeEventListener('gamepaddisconnected', this.#gamepadDisconnected);
    }
  }
}

export default TinyGamepad;

class TinyGamepad {
  #heldKeys = new Set();
  #heldMouseButtons = new Set();

  #inputMap = new Map(); // ex: "Jump" => "button1"
  #callbacks = new Map(); // ex: "Jump" => [fn1, fn2]

  #connectedGamepad = null;
  #lastButtonStates = [];
  #lastAxes = [];

  #animationFrame = null;

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
    this.useKeyboardMouse = useKeyboardMouse;
    this.ignoreIds = new Set(ignoreIds);
    this.deadZone = deadZone;

    if (this.useKeyboardMouse) {
      this._initKeyboardMouse();
    } else {
      this._initGamepadEvents();
    }
  }

  //////////////////////////////////////////

  _initGamepadEvents() {
    window.addEventListener('gamepadconnected', (e) => this._onGamepadConnect(e.gamepad));
    window.addEventListener('gamepaddisconnected', (e) => this._onGamepadDisconnect(e.gamepad));
  }

  _onGamepadConnect(gamepad) {
    if (this.ignoreIds.has(gamepad.id)) return;
    if (this.expectedId && gamepad.id !== this.expectedId) return;

    if (!this.#connectedGamepad) {
      this.#connectedGamepad = gamepad;
      this.expectedId = gamepad.id;

      this._startPolling();
      this._emit('connected', { id: gamepad.id });
    }
  }

  _onGamepadDisconnect(gamepad) {
    if (this.#connectedGamepad && gamepad.id === this.#connectedGamepad.id) {
      this.#connectedGamepad = null;
      cancelAnimationFrame(this.#animationFrame);
      this._emit('disconnected', { id: gamepad.id });
    }
  }

  _startPolling() {
    const loop = () => {
      this._checkGamepadState();
      this.#animationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  ///////////////////////////////////////

  _checkGamepadState() {
    const pads = navigator.getGamepads();
    const gp = Array.from(pads).find((g) => g && g.id === this.expectedId);
    if (!gp) return;

    this.#connectedGamepad = gp;

    gp.buttons.forEach((btn, index) => {
      const key = `button${index}`;
      const prev = this.#lastButtonStates[index]?.pressed || false;

      if (btn.pressed && !prev) this._handleInput(key, 'gamepad-button', 1, 'down');
      else if (!btn.pressed && prev) this._handleInput(key, 'gamepad-button', 0, 'up');
      else if (btn.pressed && prev) this._handleInput(key, 'gamepad-button', 1, 'hold');

      this.#lastButtonStates[index] = { pressed: btn.pressed };
    });

    gp.axes.forEach((val, index) => {
      if (Math.abs(val) < this.deadZone) val = 0;

      const key = `axis${index}`;
      const prev = this.#lastAxes[index] ?? 0;
      if (val !== prev) {
        this._handleInput(key, 'gamepad-analog', val, 'change');
      }
      this.#lastAxes[index] = val;
    });
  }

  ///////////////////////////////////

  _initKeyboardMouse() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (!this.#heldKeys.has(e.code)) {
        this.#heldKeys.add(e.code);
        this._handleInput(e.code, 'keyboard', 1, 'down');
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.#heldKeys.has(e.code)) {
        this.#heldKeys.delete(e.code);
        this._handleInput(e.code, 'keyboard', 0, 'up');
      }
    });

    // Opcional: checagem contínua para "hold"
    this._mouseKeyboardHoldLoop = requestAnimationFrame(() => {
      for (const key of this.#heldKeys) {
        this._handleInput(key, 'keyboard', 1, 'hold');
      }
      for (const btn of this.#heldMouseButtons) {
        this._handleInput(btn, 'mouse', 1, 'hold');
      }
    });
  }

  //////////////////////////////////

  /**
   * Atribui uma entrada a um nome lógico (ex: "Jump" => "button1")
   */
  mapInput(logicalName, physicalInput) {
    this.#inputMap.set(logicalName, physicalInput);
  }

  /**
   * Remove uma entrada lógica
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

  _handleInput(rawInput, source, analogValue = null, type = null) {
    const globalCbs = this.#callbacks.get('*') || [];
    for (const [logical, physical] of this.#inputMap.entries()) {
      if (physical === '*' || physical === rawInput) {
        const cbs = this.#callbacks.get(logical) || [];
        if (cbs.length < 1) continue;
        const payload = {
          type,
          type: source,
          input: rawInput,
          logicalName: logical,
          value: analogValue,
        };
        for (const cb of globalCbs) cb(payload);
        for (const cb of cbs) cb(payload);
      }
    }
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
   */
  ignoreId(id) {
    this.ignoreIds.add(id);
  }

  /**
   * Remove uma ID da lista de ignoradas
   */
  unignoreId(id) {
    this.ignoreIds.delete(id);
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
   * Exporta a configuração atual como JSON
   * @returns {string}
   */
  exportConfig() {
    return JSON.stringify(
      {
        expectedId: this.expectedId,
        ignoreIds: Array.from(this.ignoreIds),
        deadZone: this.deadZone,
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
    if (Array.isArray(config.ignoreIds)) this.ignoreIds = new Set(config.ignoreIds);
    if (typeof config.deadZone === 'number') this.deadZone = config.deadZone;
    if (Array.isArray(config.#inputMap)) {
      this.#inputMap = new Map(config.#inputMap);
    }
  }

  ////////////////////////////////////

  destroy() {}
}

export default TinyGamepad;

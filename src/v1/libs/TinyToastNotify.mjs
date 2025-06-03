/** @typedef {() => void} CloseToastFunc */

class TinyToastNotify {
  /**
   * @param {'top'|'bottom'} y - 'top' or 'bottom'
   * @param {'right'|'left'|'center'} x - 'right', 'left', or 'center'
   * @param {number} baseDuration - Base display time in ms
   * @param {number} extraPerChar - Extra ms per character
   * @param {number} fadeOutDuration - Time in ms for fade-out effect
   */
  constructor(
    y = 'top',
    x = 'right',
    baseDuration = 3000,
    extraPerChar = 50,
    fadeOutDuration = 300,
  ) {
    // Validate vertical position
    if (!['top', 'bottom'].includes(y)) {
      throw new Error(`Invalid vertical direction "${y}". Expected "top" or "bottom".`);
    }

    // Validate horizontal position
    if (!['left', 'right', 'center'].includes(x)) {
      throw new Error(`Invalid horizontal position "${x}". Expected "left", "right" or "center".`);
    }

    // Validate timing values
    for (const [key, val] of Object.entries({ baseDuration, extraPerChar, fadeOutDuration })) {
      if (typeof val !== 'number' || val < 0 || !Number.isFinite(val)) {
        throw new Error(
          `Invalid timing value for "${key}": ${val}. Must be a non-negative finite number.`,
        );
      }
    }

    this.y = y;
    this.x = x;
    this.baseDuration = baseDuration;
    this.extraPerChar = extraPerChar;
    this.fadeOutDuration = fadeOutDuration;
    this.container = document.querySelector(`.notify-container.${y}.${x}`);

    if (!(this.container instanceof HTMLElement)) {
      this.container = document.createElement('div');
      this.container.className = `notify-container ${y} ${x}`;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Displays a notification for a time based on message length.
   * Accepts a string or an object with:
   * {
   *   message: string,
   *   title?: string,
   *   onClick?: function(MouseEvent, CloseToastFunc): void,
   *   html?: boolean
   * }
   * @param {string|{ message: string, title?: string, onClick?: function(MouseEvent, CloseToastFunc): void, html?: boolean }} data
   */
  show(data) {
    let message = '';
    let title = '';
    let onClick = null;
    let useHTML = false;

    const notify = document.createElement('div');
    notify.className = 'notify enter';

    if (typeof data === 'string') {
      message = data;
    } else if (typeof data === 'object' && data !== null && typeof data.message === 'string') {
      message = data.message;
      title = typeof data.title === 'string' ? data.title : '';
      useHTML = data.html === true;

      if (data.onClick !== undefined) {
        if (typeof data.onClick !== 'function') {
          throw new Error('onClick must be a function if defined');
        }
        onClick = data.onClick;
        notify.classList.add('clickable');
      }
    } else {
      throw new Error(
        `Invalid argument for show(): expected string or { message: string, title?: string, onClick?: function, html?: boolean }`,
      );
    }

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'close';
    closeBtn.setAttribute('aria-label', 'Close');

    // Optional hover effect
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = 'var(--notif-close-color-hover)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = 'var(--notif-close-color)';
    });

    // Append elements
    if (title) {
      const titleElem = document.createElement('strong');
      titleElem.textContent = title;
      titleElem.style.display = 'block';
      notify.appendChild(titleElem);
    }

    if (useHTML) {
      const msgWrapper = document.createElement('div');
      msgWrapper.innerHTML = message;
      notify.appendChild(msgWrapper);
    } else {
      notify.appendChild(document.createTextNode(message));
    }

    notify.appendChild(closeBtn);
    notify.style.position = 'relative';
    this.container.appendChild(notify);

    const visibleTime = this.baseDuration + message.length * this.extraPerChar;
    const totalTime = visibleTime + this.fadeOutDuration;

    // Close logic
    let removed = false;
    const close = () => {
      if (removed) return;
      removed = true;
      notify.classList.remove('enter', 'show');
      notify.classList.add('exit');
      setTimeout(() => notify.remove(), this.fadeOutDuration);
    };

    // Click handler
    if (typeof onClick === 'function') {
      notify.addEventListener('click', (e) => {
        if (e.target === closeBtn) return;
        onClick(e, close);
      });
    }

    // Close button click
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // Transition activation force soon after the element is added
    setTimeout(() => {
      notify.classList.remove('enter');
      notify.classList.add('show');
    }, 1);

    setTimeout(() => close(), totalTime);
  }
}

export default TinyToastNotify;

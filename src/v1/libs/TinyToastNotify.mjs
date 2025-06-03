class TinyToastNotify {
  /**
   * @param {string} y - 'top' or 'bottom'
   * @param {string} x - 'right', 'left', or 'center'
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
   * Displays a notification for a time based on message length
   * @param {string} message
   */
  show(message) {
    const notify = document.createElement('div');
    notify.className = 'notify enter';
    notify.textContent = message;

    const visibleTime = this.baseDuration + message.length * this.extraPerChar;
    const totalTime = visibleTime + this.fadeOutDuration;
    this.container.appendChild(notify);

    // Transition activation force soon after the element is added
    setTimeout(() => {
      notify.classList.remove('enter');
      notify.classList.add('show');
    }, 1);

    setTimeout(() => {
      notify.classList.remove('enter');
      notify.classList.remove('show');
      notify.classList.add('exit');
    }, visibleTime);

    setTimeout(() => {
      notify.remove();
    }, totalTime);
  }
}

export default TinyToastNotify;

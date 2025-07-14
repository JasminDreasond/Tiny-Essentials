class UltraRandomMsgGen {
  constructor(config = {}) {
    this.defaultWords =
      'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
        ' ',
      );
    this.symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?/\\~'.split('');
    this.defaultEmojis = ['😂', '🌈', '🤖', '💥', '🐸', '🍕', '🦄', '🧠', '🧬', '🚀'];

    this.config = {
      minLength: 10,
      maxLength: 300,
      readable: true,
      useEmojis: true,
      includeNumbers: true,
      includeSymbols: true,
      allowWeirdSpacing: false,
      emojiSet: [...this.defaultEmojis],
      wordSet: [...this.defaultWords],
      mode: 'mixed', // 'mixed', 'readable', 'chaotic'
      repeatWords: true,
      emojiPlacement: 'inline', // 'inline' | 'end' | 'none'
      paragraphs: null, // { min: 1, max: 3 } ou null
      line: {
        minLength: 20,
        maxLength: 120,
        emojiChance: 0.3, // 30% de chance por linha
      },
      ...config,
    };
  }

  configure(newConfig = {}) {
    Object.assign(this.config, newConfig);
    return this;
  }

  addWords(...words) {
    this.config.wordSet.push(...words.flat());
    return this;
  }

  setEmojis(...emojis) {
    this.config.emojiSet = emojis.flat();
    return this;
  }

  _getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _generateChunk() {
    const {
      wordSet,
      emojiSet,
      includeNumbers,
      includeSymbols,
      useEmojis,
      readable,
      mode,
      emojiPlacement,
    } = this.config;

    const pools = [];

    if (readable || mode === 'readable' || mode === 'mixed') {
      pools.push(this._getRandomItem(wordSet));
    }

    if (mode === 'chaotic' || mode === 'mixed') {
      pools.push(Math.random().toString(36).slice(2));
    }

    if (includeNumbers) {
      pools.push(Math.floor(Math.random() * 99999).toString());
    }

    if (includeSymbols) {
      pools.push(this._getRandomItem(this.symbols));
    }

    if (emojiPlacement === 'inline' && useEmojis && emojiSet.length) {
      pools.push(this._getRandomItem(emojiSet));
    }

    return this._getRandomItem(pools);
  }

  _generateLine(targetLength, seenWords) {
    const { allowWeirdSpacing, repeatWords, readable, emojiSet, useEmojis, emojiPlacement, line } =
      this.config;

    const parts = [];
    seenWords ??= new Set();

    while (parts.join(' ').length < targetLength) {
      let chunk = this._generateChunk();

      if (!repeatWords && seenWords.has(chunk)) continue;
      seenWords.add(chunk);

      if (allowWeirdSpacing) {
        if (Math.random() < 0.1) chunk = '\n' + chunk;
        if (Math.random() < 0.1) chunk = '   ' + chunk;
        if (Math.random() < 0.05) chunk = chunk.toUpperCase();
      }

      parts.push(chunk);
    }

    let lineText = parts.join(readable ? ' ' : '');

    if (
      emojiPlacement === 'end' &&
      useEmojis &&
      emojiSet.length &&
      Math.random() < (line?.emojiChance || 0)
    ) {
      lineText += ' ' + this._getRandomItem(emojiSet);
    }

    return lineText;
  }

  _generateParagraphLines(totalLength) {
    const { line } = this.config;
    const lines = [];
    const seenWords = new Set();
    let currentTotal = 0;

    while (currentTotal < totalLength) {
      const lineLength = Math.floor(
        Math.random() * (line.maxLength - line.minLength + 1) + line.minLength,
      );

      const adjustedLength = Math.min(lineLength, totalLength - currentTotal);

      lines.push(this._generateLine(adjustedLength, seenWords));
      currentTotal += adjustedLength;
    }

    return lines;
  }

  generate() {
    const { minLength, maxLength, paragraphs } = this.config;

    const totalLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    if (paragraphs && typeof paragraphs === 'object') {
      const paraCount =
        Math.floor(Math.random() * (paragraphs.max - paragraphs.min + 1)) + paragraphs.min;
      const approxLength = Math.floor(totalLength / paraCount);
      const paragraphsArray = [];

      for (let i = 0; i < paraCount; i++) {
        const lines = this._generateParagraphLines(approxLength);
        paragraphsArray.push(lines.join('\n'));
      }

      return paragraphsArray.join('\n\n');
    }

    // Caso sem parágrafos definidos
    return this._generateParagraphLines(totalLength).join('\n');
  }
}

export default UltraRandomMsgGen;

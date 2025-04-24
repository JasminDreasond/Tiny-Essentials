// @ts-nocheck

/**
 * A lightweight Markdown parser that can convert to HTML or BBCode.
 * @namespace markdownManager
 */
const markdownManager = {
  /**
   * Conversion rules for Markdown elements.
   * Each rule includes a regex pattern, an HTML output, and a BBCode equivalent.
   */
  values: {
    h3: {
      regex: /^### (.*$)/gim,
      result: '<h3>$1</h3>',
      bbcode: '[h3]$1[/h3]',
    },
    h2: {
      regex: /^## (.*$)/gim,
      result: '<h2>$1</h2>',
      bbcode: '[h2]$1[/h2]',
    },
    h1: {
      regex: /^# (.*$)/gim,
      result: '<h1>$1</h1>',
      bbcode: '[h1]$1[/h1]',
    },
    blockquote: {
      regex: /^\> (.*$)/gim,
      result: '<blockquote>$1</blockquote>',
      bbcode: '[blockquote]$1[/blockquote]',
    },
    strong: {
      regex: /\*\*(.*)\*\*/gim,
      result: '<strong>$1</strong>',
      bbcode: '[b]$1[/b]',
    },
    italic: {
      regex: /\*(.*)\*/gim,
      result: '<i>$1</i>',
      bbcode: '[i]$1[/i]',
    },
    image: {
      regex: /!\[(.*?)\]\((.*?)\)/gim,
      result: "<img alt='$1' src='$2' />",
      bbcode: '[img="$2"]',
    },
    url: {
      regex: /\[(.*?)\]\((.*?)\)/gim,
      result: "<a href='$2'>$1</a>",
      bbcode: '[href="$2"]$1[/i]',
    },
    br: {
      regex: /\n$/gim,
      result: '<br />',
      bbcode: '\n',
    },
  },

  /**
   * Parses Markdown content into HTML or BBCode.
   * @param {string} markdownText - The input Markdown string.
   * @param {'result' | 'bbcode'} [type='result'] - The desired output type.
   * @returns {string} The converted string.
   *
   * @example
   * markdownManager.parseMarkdown("**bold**"); // <strong>bold</strong>
   * markdownManager.parseMarkdown("**bold**", "bbcode"); // [b]bold[/b]
   */
  parseMarkdown: function (markdownText, type = 'result') {
    let htmlText = markdownText;

    for (const item in markdownManager.values) {
      const rule = markdownManager.values[item];
      const replacer = rule[type];

      if (typeof replacer === 'string' || typeof replacer === 'function')
        htmlText = htmlText.replace(rule.regex, replacer);
    }

    return htmlText.trim();
  },
};

export default markdownManager;

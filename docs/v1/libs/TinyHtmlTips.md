# 🔧 TinyHtml Shortcuts & Aliases

One of the coolest things about **TinyHtml** is that you can give its static methods **custom names (aliases)** 🎉.
This allows you to mimic the style of jQuery, native browser functions, or even create your own conventions for working with the DOM.

---

## 🎭 Mimic jQuery Style

If you’re a fan of jQuery’s `$` syntax, you can directly alias TinyHtml methods:

```js
// Select multiple elements (like jQuery's $)
const $ = TinyHtml.queryAll;

// Usage
$('.my-class').forEach(el => console.log(el));
```

---

## 💎 Super jQuery-like Style

If you want TinyHtml to feel **almost exactly like jQuery**, you can define `$` as a **function wrapper** that automatically instantiates a `TinyHtml` object from a CSS selector.

```js
// jQuery-style $ function
const $ = (queryString) => new TinyHtml(queryString);

// Usage
$('#my-id').addClass('highlight');
$('.btn').on('click', () => alert('Clicked!'));
```

---

## 🌐 Mimic Native Browser Querying

If you prefer the style of the **native browser query** functions (`querySelector` and `querySelectorAll`), you can do:

```js
// Select single element (like document.querySelector)
const $ = TinyHtml.query;

// Select multiple elements (like document.querySelectorAll)
const $$ = TinyHtml.queryAll;

// Usage
const button = $('#my-button');
const divs = $$('.container');
```

---

## 🛠️ Extra: Element Creation Shortcut

TinyHtml also supports element creation. You can alias this too for faster coding:

```js
// Create elements from plain strings
const $$$ = TinyHtml.createFrom;

// OR, if you want it more explicit:
const $$$ = TinyHtml.createFromHtml;

// Usage
const newDiv = $$$('<div class="box">Hello!</div>');
```

---

## 🚀 Why Aliases?

Aliases are especially handy when:

* You want **shorter code** ✨
* You’re working on **personal projects** with a custom coding style
* You want to **simulate familiar APIs** like jQuery or browser query functions

---

👉 In summary, **TinyHtml is flexible**: you can stick to its original method names for clarity, or create **shortcuts** to match your own workflow.

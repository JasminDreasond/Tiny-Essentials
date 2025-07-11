### 🚀 `areHtmlElsColliding()`

Check if two DOM elements are **colliding on the screen**! Perfect for games, draggable elements, UI interactions, and more.

This function checks whether **two HTML elements are overlapping** (colliding) within the viewport. It uses their bounding boxes (`getBoundingClientRect()`) to perform a simple AABB (Axis-Aligned Bounding Box) collision detection.

Combine it with `mousemove`, `drag`, or animation listeners for dynamic collision detection in real-time!

It compares the bounding rectangles of both elements:

* ✅ Checks if **rect1** is NOT entirely to the left, right, above, or below **rect2**.
* ✅ If none of these are true, then the elements are overlapping.

#### 🧠 Syntax

```javascript
areHtmlElsColliding(elem1, elem2);
```

#### 🎯 Parameters

| Parameter | Type      | Description             |
| --------- | --------- | ----------------------- |
| `elem1`   | `Element` | The first DOM element.  |
| `elem2`   | `Element` | The second DOM element. |

#### 🔁 Return

| Type      | Description                                                        |
| --------- | ------------------------------------------------------------------ |
| `boolean` | ✅ `true` if elements are colliding. <br>❌ `false` if they are not. |

#### 📦 Example

```javascript
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');

if (areHtmlElsColliding(box1, box2)) {
  console.log('🎯 Collision detected!');
} else {
  console.log('❌ No collision.');
}
```

#### 🚧 Limitations

* Only works with **axis-aligned elements** (rectangular shapes).
* Does not handle rotated elements or complex shapes.

---

### 🔲 `getHtmlElBordersWidth(el)`

📏 Returns the total **border width** of an element using `border{Side}Width` values from computed styles.

```js
getHtmlElBordersWidth(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object containing total horizontal/vertical border widths, and each side individually.

---

### 🔳 `getHtmlElBorders(el)`

📐 Returns the total **border size** of an element using `border{Side}` shorthand values from computed styles.

```js
getHtmlElBorders(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object with total horizontal/vertical border sizes and all four sides.

---

### ➖ `getHtmlElMargin(el)`

📏 Returns the total **margin** of an element using `margin{Side}` from computed styles.

```js
getHtmlElMargin(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object containing margin values for each side and totals for horizontal (`x`) and vertical (`y`).

---

### ➕ `getHtmlElPadding(el)`

🧩 Returns the total **padding** of an element using `padding{Side}` from computed styles.

```js
getHtmlElPadding(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: Padding values for all sides and summed horizontal (`x`) and vertical (`y`) values.

# 🔍 Regex Helpers

Welcome to the **Regex Helpers** guide! ✨
This document provides a collection of **ready-to-use regex patterns** to help you **transform JavaScript code** more efficiently.
It’s especially useful when **migrating from jQuery to TinyHtml**, making your workflow faster, cleaner, and less error-prone. 🚀

👉 These helpers were tested only in **Visual Studio Code**, so results may vary in other editors.

---

## ⚡ Basic Function Replacements

Simplify and streamline JavaScript function transformations.

**🔄 Replace `attr`:**

```ruby
attr\(([^,]+),\s*([^)]+)\)
```

➡️ with `setAttr`:

```ruby
setAttr($1, $2)
```

---

## 🛠️ Migrating from jQuery to TinyHtml

### 📥 Match jQuery with arguments

```ruby
\$\(\s*['"]<([^'"]+)>['"]\s*,\s*([\s\S]*?)\)
\$\((?:\s|\n)*['"]<([^'"]+)>['"](?:\s|\n)*,(?:\s|\n)*([\s\S]*?)(?:\s|\n)*\)
```

➡️ Replace with:

```ruby
TinyHtml.createFrom('$1', $2)
```

---

### 📦 Match jQuery without arguments

```ruby
\$\(\s*['"]<([^'"]+)>['"]\s*\)
\$\((?:\s|\n)*['"]<([^'"]+)>['"](?:\s|\n)*\)
```

➡️ Replace with:

```ruby
TinyHtml.createFrom('$1')
```

---

### 🔎 Match jQuery queries

```ruby
\$\(\s*['"]([^'"]+)['"]\s*\)
\$\((?:\s|\n)*['"]([^'"]+)['"](?:\s|\n)*\)
```

➡️ Replace with:

```ruby
TinyHtml.query('$1')
```

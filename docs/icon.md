---
layout: doc
title: requirejs-dplugins/icon
---

# requirejs-dplugins/icon!

This plugin load svg icons and declares them in one sprite, insert inline in the DOM, so that you can reference them
in a `<use>` tag.

## Example

```js
define([
    "requirejs-dplugins/icon!./icon1.svg",
    "requirejs-dplugins/icon!./icon2.svg"
], function(){...})
```

This will fetch `icon1.svg` and `icon2.svg` and add two symbols to the sprite.
```svg
<svg>
	...
	<symbol id="icon1" viewBox="..." > ... </symbol>
	<symbol id="icon2" viewBox="..." > ... </symbol>
</svg>
```

You can then use the icons anytime only with

```
<svg>
	<use xlink:href="#icon1"></use>
</svg>
```

## Build
The build step will merge all icons in one sprite beforehand and save the result in a `<layer>.min.svg`. 
When running the built version, this sprite is fetched as soon as one of the icons inside is required.
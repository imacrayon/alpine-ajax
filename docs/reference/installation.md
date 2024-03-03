---
eleventyNavigation:
  key: Installation
  url: /reference/#installation
  order: 1
---

## Installation

You can use Alpine AJAX by either including it from a `<script>` tag or installing it via NPM.

### Via CDN

Include the CDN build of Alpine AJAX as a `<script>` tag, just make sure to include it **before** Alpine's core JS file.

```html
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.11.1/dist/cdn.min.js"></script>
```

### Via NPM

Install Alpine AJAX from NPM for use inside your bundle like so:

```bash
npm i @imacrayon/alpine-ajax
```

Then initialize it from your bundle:

```js
import Alpine from 'alpinejs'
import ajax from '@imacrayon/alpine-ajax'

window.Alpine = Alpine
Alpine.plugin(ajax)
```

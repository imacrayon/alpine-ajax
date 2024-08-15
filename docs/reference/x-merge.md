---
eleventyNavigation:
  key: x-merge
  url: /reference/#x-merge
  order: 5
---

## x-merge

By default incoming HTML from the server will `replace` a targeted element. You can add `x-merge` to a **targeted element** to change how it merges incoming content. For example, if you wanted to `append` new items to a list of messages, you would add `x-merge="append"` to the list:

```html
<ul id="messages" x-merge="append">
  <li>First message</li>
</ul>
```

New HTML sent from the server might look like this:

```html
<ul id="messages">
  <li>Second message</li>
</ul>
```
And after the HTML is merged, you'll have a list with two items:

```html
<ul id="messages" x-merge="append">
  <li>First message</li>
  <li>Second message</li>
</ul>
```

There are a total of seven merge strategies you can use, `replace` is the default strategy:

<div id="merge-strategies" class="table">
<table>
  <thead>
    <th scope="col" width="60">Strategy</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>before</code></td>
    <td>Inserts the content of the incoming element before the target element.</td>
  </tr>
  <tr>
    <td><code>replace</code></td>
    <td><strong>(Default)</strong> Replaces the target element with the incoming element.</td>
  </tr>
  <tr>
    <td><code>update</code></td>
    <td>Updates the target element's content with the incoming element's content.</td>
  </tr>
  <tr>
    <td><code>prepend</code></td>
    <td>Prepends the target element's content with the incoming element's content.</td>
  </tr>
  <tr>
    <td><code>append</code></td>
    <td>Appends the target element's content with the incoming element's content.</td>
  </tr>
  <tr>
    <td><code>after</code></td>
    <td>Inserts the content of the incoming element after the target element.</td>
  </tr>
  </tbody>
</table>
</div>

You can change the default merge strategy for all AJAX requests using the `mergeStrategy` global [configuration option](#configuration).

### Morphing

Alpine AJAX supports using the [Alpine Morph Plugin](https://alpinejs.dev/plugins/morph) as a merge strategy for when you want to update content and preserve UI state in a more fine-grained way.

To enable the morph strategy, install the Morph Plugin **before** installing Alpine AJAX.

Via CDN:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/morph@{{ APLINE_VERSION }}/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@{{ APLINE_VERSION }}/dist/cdn.min.js"></script>

```

Or via NPM:

```bash
npm i @alpinejs/morph
```

```js
import Alpine from 'alpinejs'
import morph from '@alpinejs/morph'
import ajax from '@imacrayon/alpine-ajax'

window.Alpine = Alpine
Alpine.plugin(morph)
Alpine.plugin(ajax)
```

With the Morph Plugin installed you can use `x-merge="morph"` to morph content changes on the page.

### View transitions & animations

You can animate transitions between different DOM states using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). This API is still in active development and is currently only supported in Chrome browsers. Alpine AJAX provides support for View Transitions and gracefully falls back to no animations if the API is not available in a browser.

To enable View Transitions on an element use the `x-merge.transition` modifier. When enabled in a supported browser, you should see content automatically animate as it is merged onto the page. You can customize any transition animation via CSS by following [Chrome's documentation for customizing transitions](https://developer.chrome.com/docs/web-platform/view-transitions/#simple-customization).

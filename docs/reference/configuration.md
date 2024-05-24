---
eleventyNavigation:
  key: Configuration
  url: /reference/#configuration
  order: 11
---

## Configuration

You have the option to configure the default behavior of Alpine AJAX when importing it in your code:

```js
import ajax from '@imacrayon/alpine-ajax'

Alpine.plugin(ajax.configure({
  followRedirects: false,
  headers: { 'X-CSRF-Token': 'mathmatical!' },
  mergeStrategy: 'morph'
}))
```

Here are the configuration options and there defaults:

<div class="table">
<table>
  <thead>
    <th scope="col" width="68">Option</th>
    <th scope="col" width="60">Default</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>followRedirects</code></td>
    <td><code>true</code></td>
    <td>Switch this to <code>false</code> and AJAX requests will reload the browser window when they encounter a redirect response. You can then follow redirects case-by-case using the <code>follow</code> modifier on <code>x-target</code>.</td>
  </tr>
  <tr>
    <td><code>headers</code></td>
    <td><code>{}</code></td>
    <td>Additional request headers, as key/value pairs, included in every AJAX request.</td>
  </tr>
  <tr>
    <td><code>mergeStrategy</code></td>
    <td><code>'replace'</code></td>
    <td>Set the default <a href="#merge-strategies">merge strategy</a> used when new content is merged onto the page.</td>
  </tr>
  </tbody>
</table>
</div>

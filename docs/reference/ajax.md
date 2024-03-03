---
eleventyNavigation:
  key: $ajax
  url: /reference/#ajax
  order: 8
---

## $ajax

The `$ajax` magic helper is for finer-grained AJAX control. Use it to programmatically issue AJAX requests in response to events. Here we've wired it up to an input's `change` event to perform some server-side validation for an email:

```html
<div id="email_field" x-data="{email : ''}" @change="$ajax('/validate-email', {
  method: 'post',
  body: { email },
})">
  <label for="email">Email</label>
  <input type="email" name="email" id="email" x-model="email">
</div>
```

In this example we make a `POST` request with the `email` value to the `/validate-email` endpoint. See the [Inline Validation example](/examples/inline-validation) for a complete demonstration.

**Note:** Since `$ajax` is intended to be used in side effects it doesn't emit any events or target `x-sync` elements like `x-target`. However, you can change these defaults using the `$ajax` options.

### $ajax options

<div class="table">
<table>
  <thead>
    <th scope="col" width="68">Option</th>
    <th scope="col" width="60">Default</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>method</code></td>
    <td><code>'GET'</code></td>
    <td>The request method.</td>
  </tr>
  <tr>
    <td><code>target</code></td>
    <td><code>''</code></td>
    <td>The request target. If this is empty <code>x-target</code> is used.</td>
  </tr>
  <tr>
    <td><code>targets</code></td>
    <td><code>[]</code></td>
    <td>Same as <code>target</code>, but specified as an array of strings. If this is empty <code>target</code> is used.</td>
  </tr>
  <tr>
    <td><code>body</code></td>
    <td><code>{}</code></td>
    <td>The request body.</td>
  </tr>
  <tr>
    <td><code>events</code></td>
    <td><code>false</code></td>
    <td>Setting this to <code>true</code> will fire AJAX request events.</td>
  </tr>
  <tr>
    <td><code>focus</code></td>
    <td><code>false</code></td>
    <td>Setting this to <code>true</code> will enable `x-autofocus` & `autofocus` behavior.</td>
  </tr>
  <tr>
    <td><code>sync</code></td>
    <td><code>false</code></td>
    <td>Setting this to <code>true</code> will include <code>x-sync</code> targets in the request.</td>
  </tr>
  <tr>
    <td><code>followRedirects</code></td>
    <td><code>true</code></td>
    <td>Switch this to <code>false</code> and AJAX requests will reload the browser window when they encounter a redirect response.</td>
  </tr>
  <tr>
    <td><code>headers</code></td>
    <td><code>{}</code></td>
    <td>Additional request headers as key/value pairs.</td>
  </tr>
  </tbody>
</table>
</div>

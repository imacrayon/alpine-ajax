---
layout: layout.webc
title: Reference
---

# Reference

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

## Usage

It’s good practice to start building your UI **without** Alpine AJAX. Make your entire website work as it would if Alpine AJAX were not available, then sprinkle in AJAX functionality at the end. Working in this way will ensure that your AJAX interactions degrade gracefully [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html): Links and forms will continue to work as normal, they simply won't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your website.

## x-target

Add the `x-target` attribute to forms or links to enable AJAX behavior. The value of `x-target` should equal the `id` of an element on the page that the form or link should target.

Take a look at the following comment list markup, notice the `x-target="comments"` attribute on the `<form>`:

```html
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-target="comments" method="post" action="/comment">
  <input aria-label="Comment text" name="text" required />
  <button>Submit</button>
</form>
```

When the form is submitted a `POST` request is issued to `/comment` and the `#comments` list will be replaced with the element that has `id="comments"` in the AJAX request's response.

### Multiple Targets

You can replace multiple elements from a single server response by separating `id`s with a space.

Here's an expanded comment list example:

```html
<h2>Comments (<span id="comments_count">1</span>)</h2>
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-target="comments comments_count" method="post" action="/comment">
  <input name="comment" required />
  <button>Submit</button>
</form>
```

Now, when the form is submitted, both the `#comments` list, and the `#comments_count` indicator will be updated.

### Target Shorthand

In cases when a form or link targets itself, you may leave the value of `x-target` blank, however the form or link must still have an `id`:

```html
<form x-target id="star_repo" method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

## x-arrange

Use `x-arrange` to control how targeted elements will handle incoming AJAX content. By default, incoming content will `replace` a targeted element, instead you can choose one of the 7 other options for arranging content:

<div class="table">
<table>
  <thead>
    <th scope="col" width="60">Option</th>
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
  <tr>
    <td><code>remove</code></td>
    <td>Removes the target element from the DOM.</td>
  </tr>
  <tr>
    <td><code>morph</code></td>
    <td>Morphs the incoming element into the target element using the <a href="https://alpinejs.dev/plugins/morph">Alpine Morph Plugin</a>.</td>
  </tr>
  </tbody>
</table>
</div>

The `morph` option uses a DOM diffing algorithm to update HTML, it's a bit more computationally intensive, but it works great in situations where you need to preserve your Alpine component's state and keyboard focus. In contrast, the `replace`, `update`, and `remove` options will each wipe away DOM state with fresh HTML.

## x-focus

Add `x-focus` to a form or link to control keyboard focus after an AJAX request has completed. The `x-focus` attribute accepts an element `id` that will be focused. Consider the following markup, we'll assume that clicking the "Edit" link will load a form to change the listed email address:

```html
<div x-target id="contact_1">
  <p>fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit" x-focus="email_field">Edit</a>
</div>
```

The `x-focus` attribute on the "Edit" link ensures that the element with `id="email_field"` will be focused after the requested edit form is injected onto the page.

Controlling focus is important for providing [meaningful sequencing](https://www.w3.org/TR/WCAG21/#meaningful-sequence) and [focus order](https://www.w3.org/TR/WCAG21/#focus-order) for keyboard users, however, take care not to overuse focus control. This attribute should primarily be used to prevent the keyboard focus from disappearing when page content changes.

It's worth noting that `x-arrange="morph"` is another way to preserve keyboard focus between content changes. However, there are cases when the DOM is transformed so much that the Morph algorithm is unable to reliably preserve focus state. In theses situations `x-focus` can correct any focus discrepancies.

## x-sync

Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `x-target`.

`x-sync` elements must have a unique `id`. Any element sent from the server with a matching `id` will replace the existing `x-sync` element.

Use cases for this attribute are unread message counters or notification flashes. These elements often live in the base layout, outside of the content area that is being replaced.

Consider this list of notifications:

```html
<div aria-live="polite">
  <ul x-sync id="notifications"></ul>
</div>
```

Every server response that includes an element with `id="notifications"` will replace the existing list of notifications inside the `aria-live` region. Take a look at the [Notifications example](/examples/notifications) for a complete demonstration of this UI pattern.

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
    <td><code>sync</code></td>
    <td><code>false</code></td>
    <td>Setting this to <code>true</code> will include <code>x-sync</code> targets in the request.</td>
  </tr>
  </tbody>
</table>
</div>



## AJAX Events

You can listen for AJAX events to perform additional actions during an AJAX request:

<div class="table">
<table>
  <thead>
    <th scope="col" width="117">Name</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>ajax:before</code></td>
    <td>Fired before a network request is made. If this event is canceled using <code>$event.preventDefault()</code> the request will be aborted.</td>
  </tr>
  <tr>
    <td><code>ajax:success</code></td>
    <td>Fired when a network request completes. <code>detail</code> contains the server response data.</td>
  </tr>
  <tr>
    <td><code>ajax:error</code></td>
    <td>Fired when a request responds with a `400` or `500` status code. <code>detail</code> contains the server response data.</td>
  </tr>
  <tr>
    <td><code>ajax:after</code></td>
    <td>Fired after every successful or unsuccessful request.</td>
  </tr>
  <tr>
    <td><code>ajax:missing</code></td>
    <td>Fired if a matching target is not found in the response body. <code>detail</code> contains the server response data. You may cancel this event using <code>$event.preventDefault()</code> to override the default behavior.</td>
  </tr>
  </tbody>
</table>
</div>

Here's an example of aborting a form request when the user cancels a dialog prompt:

```html
<form id="delete_user" x-init x-target @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
  <button>Delete User</button>
</form>
```

**Note:** The `ajax:success` and `ajax:error` events only convey the status code of an AJAX request. You'll probably find that [Server Events](/examples/server-events/) are better for triggering actions based on your server's response.

## Loading States

While an AJAX request is in progress there are a few loading states to be aware of:

  * If a form submission triggered the request, the form's submit button is automatically disabled, this prevents users from triggering additional network requests by accidentally double clicking the submit button.
  * During an AJAX request, `aria-busy="true"` is set on all targets of the request. This attribute can be used in CSS to provide a loading indicator, check out the [Loading Indicator example](/examples/loading) for more details.

## Creating Demos

Use the mock server script included with Alpine AJAX when you need to build a quick prototype or demonstrate a bug, without a server. The mock server script adds a global `route` helper function for mocking server endpoints on the frontend:

```html
<!--
Include the typical required scripts before the mock server:
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.11.1/dist/cdn.min.js"></script>
-->
<script src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/server.js"></script>

<script>
route('POST', '/update-quantity', (request) => {
  return `<output id="current_quantity">${Number(request.quantity)}</output>`
})
</script>

<label for="current_quantity">Current quantity</label>
<output id="current_quantity">0</output>
<form x-target="current_quantity" method="POST" action="/update-quantity">
  <label form="quantity">New quantity</label>
  <input type="number" id="quantity" name="quantity">
  <button>Update</button>
</form>
```

Now, instead of issuing a real `POST` request to `/update-quantity`, Alpine AJAX will use the HTML returned in our route definition as the response. Note that any form data included in the AJAX request is made available too you in the `route` function.

<details>
  <summary>Mock server example on CodePen</summary>
  <div>
    <p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="NWLZOrP" data-user="imacrayon" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
      <span>See the Pen <a href="https://codepen.io/imacrayon/pen/NWLZOrP">
      Alpine AJAX Demo</a> by Christian Taylor (<a href="https://codepen.io/imacrayon">@imacrayon</a>)
      on <a href="https://codepen.io">CodePen</a>.</span>
    </p>
    <script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
  </div>
</details>

**Important**: The mock server should only be used for demos and testing, this utility is not designed for production environments.

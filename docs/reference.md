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

Alpine AJAX is designed to make it easy to build resilient, accessible user interfaces. It’s good practice to start your interaction design **without** Alpine AJAX. Make your entire application work as it would if Alpine AJAX were not available, then sprinkle in AJAX functionality at the end. Working in this way will ensure that your AJAX interactions degrade gracefully [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html): Links and forms continue to work as normal, they simply don't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your sites functionality.

## x-ajax

This directive defines an AJAX Component. All link clicks and form submissions inside an AJAX Component are captured, and the component is automatically updated after receiving a response. Regardless of whether the server provides a full document, or just a HTML fragment, only the AJAX Component that triggered the request will be extracted from the response and updated on the page.

AJAX Components must have a unique `id`. The `id` is used to find a matching element in the  HTML response sent from the server. You'll see a helpful error in the console if you forget to include an `id` on any AJAX Component.

Consider this editable email address:

```html
<div x-ajax id="contact_1">
  <p>fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit">Edit</a>
</div>
```

When the "Edit" link is clicked, the server should return a page containing a form for editing the email:

```html
<h1>Edit Contact Details</h1>
<form x-ajax id="contact_1" method="put" action="/contacts/1">
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="fmertens@candykingdom.gov">
  </div>
  <button>Update</button>
</form>
```

Since the `<form>` in this response has `id="contact_1"`. The original contact details will be replaced with the edit form. Notice that the page's `<h1>` isn't inside the `<form>`. This means it'll be ignored when the form replaces the contact details.

### A note on client-side routing

Since `x-ajax` causes all child links to make AJAX requests you might be tempted to slap an `x-ajax` attribute on the `<body>` element of your page to create a client-side router. While this _is possible_ it will break the accessibility of your website it critical ways. Instead we recommend using a prefetching library such as [instant.page](https://instant.page/) or Google's [Quicklink](https://getquick.link/). These libraries will speed up your website's navigation without the accessibility drawbacks.

## x-target

Use the `x-target` attribute to target another element that will be replaced on the page when AJAX requests are issued. `x-target` should be set to the `id` of element on the page.

Take a look at this comment list, notice the `x-target="comments"` attribute on the `<form>`:

```html
<ul id="comments">
  <li>Comment #1</li>
</ul>
<h2 id="comment_form_title">Post a Comment</h2>
<form x-ajax x-target="comments" method="post" action="/comment" aria-labelledby="comment_form_title">
  <input aria-label="Comment text" name="text" required />
  <button>Submit</button>
</form>
```

When the "Post a Comment" form is submitted the `comments` list will be updated with the response instead of the form.

### Multiple targets

You can even replace multiple elements from the same server response by separating `id`s with a space.

Here's an expanded comment list example:

```html
<h2>Comments (<span id="comments_count">1</span>)</h2>
<ul id="comments">
  <li>Comment #1</li>
</ul>
<h2 id="comment_form_title">Post a Comment</h2>
<form x-ajax x-target="comments comments_count" method="post" action="/comment" aria-labelledby="comment_form_title">
  <input name="comment" required />
  <button>Submit</button>
</form>
```

Now, when the form is submitted, both the `comments` list, and the `comments_count` indicator will be updated.

## x-arrange

Use `x-arrange` to control how targeted elements will handle incoming AJAX elements. By default, all elements will `replace` the target element, instead you can choose one of the 7 other options for arranging content:

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
    <td>Morphs the incoming element into the target element using the <a href="https://alpinejs.dev/plugins/morph">Alpine Morph Plugin</a>. Requires that the Morph Plugin is installed.</td>
  </tr>
  </tbody>
</table>
</div>

The `morph` option uses a DOM diffing algorithm to update HTML, it's a bit more computationally intensive, but it works great in situations where you need to preserve your Alpine component's state and keyboard focus. In contrast, the `replace`, `update`, and `remove` options will each wipe away DOM state with fresh HTML.

## x-focus

Add `x-focus` to a form or link to control keyboard focus after an AJAX request has completed. The `x-focus` attribute accepts an element ID that will be focused. Consider this editable email address, we'll assume that clicking the "Edit" link will load a form to change the email:

```html
<div x-ajax id="contact_1">
  <p>fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit" x-focus="email_field">Edit</a>
</div>
```

The `x-focus` attribute on the "Edit" link ensures that when the edit form is loaded, the element with `id="email_field"` will be focused.

Controlling focus is important for providing [meaningful sequencing](https://www.w3.org/TR/WCAG21/#meaningful-sequence) and [focus order](https://www.w3.org/TR/WCAG21/#focus-order) for keyboard users, however, take care not to overuse focus control. This attribute should mostly be used to prevent the keyboard focus from disappearing when content changes.

It's worth noting that using `x-arrange="morph"` is another way to preserve keyboard focus between content changes. Use `x-focus` in cases where content on the page is transformed so much that the morph algorithm is unable to reliably preserve focus state.

## x-noajax

You can stop AJAX behavior on any element by adding the `x-noajax` attribute. Just like `x-ajax`, `x-noajax` is inherited by child elements.

Review this navigation that demonstrates `x-noajax` at work:

```html
<nav x-ajax id="sidebar">
  <ul>
    <li><a x-noajax href="/page-1">Disabled</a></li>
    <li x-noajax><a href="/page-2">Disabled by parent</a></li>
    <li><a href="/page-3">AJAX enabled</a></li>
  </ul>
</nav>
```

 The first two links will behave like regular links, causing a full page reload when clicked. Only the third link will issue an AJAX request.

## x-sync

Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `x-target`.

`x-sync` elements must have a unique `id`. The `id` is used to match the content being replaced when requesting content from the server.

Use cases for this are unread message counters or notification flashes. These elements often live in the base layout, outside of the content area that is being replaced.

Consider this list of notifications:

```html
<div aria-live="polite">
  <ul x-sync id="notifications"></ul>
</div>
```

Every server response that includes a `notifications` element will get inserted into this `aria-live` region. Take a look at the [Notifications example](/examples/notifications) for a demonstration.

## x-load

The `x-load` directive works just like Alpine's `x-init`, the only difference being that `x-load` will run each time a component is reloaded by an AJAX response. In contrast, `x-init` will only run the first time the component is initialized on the page.

Here we're using `x-load` to continuously poll for new data every second:

```html
<div x-load="setTimeout(() => $ajax('/progress'), 1000)">
  <label for="file">File progress:</label>
  <progress id="file" max="100" value="70">70%</progress>
</div>
```

Note that if we were to replace `x-load` with `x-init` in this markup, the polling request would only be issued once. See the [Progress Bar example](/examples/progress-bar) for a more complete demonstration.

## $ajax

The `$ajax` magic helper is `x-ajax`'s little sidekick. While `x-ajax` alone should cover about 80% of your use cases, there are still cases where you might need fine-grained AJAX control. That's where `$ajax` comes in, use it to programmatically issue AJAX requests in response to events. Here we've wired it up to an input's `change` event to perform some server-side validation for an email:

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

**Note:** Since `$ajax` is intended to be used in side effects it doesn't emit any events or target `x-sync` elements like `x-ajax`. However, you can change these defaults using the `$ajax` options.

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
    <td><code>get</code></td>
    <td>The request method.</td>
  </tr>
  <tr>
    <td><code>body</code></td>
    <td><code>null</code></td>
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
<form x-ajax id="delete_user" @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
  <button>Delete User</button>
</form>
```

**Note:** The `ajax:success` and `ajax:error` events only convey the status code of an AJAX request. You'll probably find that [Server Events](#server-events) are better for triggering actions based on your server's response.

## Loading states

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
<form x-ajax x-target="current_quantity" method="POST" action="/update-quantity">
  <label form="quantity">New quantity</label>
  <input type="number" id="quantity" name="quantity">
  <button>Update</button>
</form>
```

Now, instead of issuing a real `POST` request to `/update-quantity`, Alpine AJAX will simply use the HTML returned in our route definition as the response. Note that any form data included in the AJAX request is made available too you in the `route` function.

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

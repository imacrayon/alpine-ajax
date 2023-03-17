---
layout: layout.webc
---

# Reference

## Installation

You can use Alpine AJAX by either including it from a `<script>` tag or installing it via NPM. You _must_ also include the [Alpine Morph](https://alpinejs.dev/plugins/morph) plugin for Alpine AJAX to work.

### Via CDN

Include the CDN build of Alpine AJAX & Morph as a `<script>` tag, just make sure to include it **before** Alpine's core JS file.

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/morph@3.11.1/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.1.3/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.10.5/dist/cdn.min.js"></script>
```

### Via NPM

Install Alpine AJAX & Morph from NPM for use inside your bundle like so:

```bash
npm i @imacrayon/alpine-ajax @alpinejs/morph
```

Then initialize it from your bundle:

```js
import Alpine from 'alpinejs'
import morph from '@alpinejs/morph'
import ajax from '@imacrayon/alpine-ajax'

window.Alpine = Alpine
Alpine.plugin(morph)
Alpine.plugin(ajax)
```

## Usage

Alpine AJAX is designed to make it easy to build resilient, accessible user interfaces. It’s good practice to start your interaction design **without** Alpine AJAX. Make your entire application work as it would if Alpine AJAX were not available, then sprinkle in AJAX functionality at the end. Working in this way will ensure that your AJAX interactions degrade gracefully [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html): Links and forms continue to work as normal, they simply don't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your sites functionality.

## x-ajax

This directive defines an AJAX Component. All link clicks and form submissions inside an AJAX Component are captured, and the component is automatically updated after receiving a response. Regardless of whether the server provides a full document, or just a HTML fragment, only the AJAX Component that triggered the request will be extracted from the response and updated on the page.

AJAX Components must have a unique `id`. The `id` is used to find the AJAX Component in the  HTML response sent from the server. You'll see a helpful error in the console if you forget to include an `id` on any AJAX Component.

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

### x-target

Add the `x-target` attribute to target another element `id` on the page to be replaced instead of the default `x-ajax` component.

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

#### Multiple targets

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

### x-noajax

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

### x-ajax events

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

**Note:** The `ajax:success` and `ajax:error` events only convey the status code of a request. You'll often find that using the [Server Events](#server-events) pattern is what you need to build more robust applications.

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

## $ajax

The `$ajax` magic helper is `x-ajax`'s little sidekick. While `x-ajax` alone should cover about 80% of your use cases, there are still cases where you might need fine-grained AJAX control. That's where `$ajax` comes in, use it to programmatically issue AJAX requests in response to events. Here we've wired it up to an input's `change` event to perform some server-side validation for an email:

```html
<div
  x-data="{ email: '' }"
  @change="$ajax('/validate-email', {
    method: 'post',
    body: { email: this.email }
  })"
>
  <label for="email">Email</label>
  <input type="email" name="email" id="email" x-model="email">
</div>
```

In this example we make a `POST` request with the `email` value to the `/validate-email` endpoint. If the email is invalid the server should return the field markup including an error.

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

### Server events

Using `$ajax` to issuing AJAX requests in response to custom events is where the real magic happens, check out this markup for a list of comments:

```html
<ul x-init @comment_added.window="$ajax('/comments')" id="comments">
```

This comment list will listen for an event named `comment_added` to trigger on the root `window` object. When the `comment_added` event is triggered a `GET` request is issued to `/comments` and the comments list is reloaded with a fresh list of comments.

Alpine makes it easy to dispatch custom events (like `comment_added`) from any component using the `$dispatch` magic helper. You can trigger the `comment_added` event after a successful form submission by including markup like this in your server response:

```html
<script x-init="$dispatch('comment_added')"></script>
```

Combining `$ajax` with events rendered from the server provides a powerful pattern you can use to share your server's state between desperate parts of your interface. Let's break this pattern down with an example:

Imagine a basic comment thread, after a comment is created, you would like to perform the following:
1. Display a notification message
2. Increment a comment count
3. Add the new comment to a listing of all comments
4. Close an open dialog somewhere in your UI
5. Load details related to the comment's author

You might be inclined to create a form that updates a big, ugly, list of targets like this:

```html
<form x-ajax method="post" action="/comments" x-target="notifications comment_counter comments_list comment_dialog comment_author">
```

Instead, wire up each of your UI elements to respond to a single `comment_added` event:

```html
// With a single dispatched event you can...
<script x-init="$dispatch('comment_added', { comment_id: 3 })"></script>

// ...reveal a notification...
<div role="alert" x-data="{ show: false }" x-show="show" @comment_added.window="this.show = true">

// ...increment a counter...
<span x-data="{ commentCount: 2 }" @comment_added.window="commentCount++" x-text="commentCount">

// ...refresh a listing...
<ul x-data @comment_added.window="$ajax('/comments')" id="comments_list">

// ...close an open dialog window...
<dialog x-data @comment_added.window="$el.close()">

// ...load related details...
<div x-data @comment_added.window="$ajax(`/comments/${$event.detail.comment_id}/author`)">

// ...any UI actions you can dream up, all triggered from a single event.
```

An `x-sync` container in your base layout serves as a convenient place to dispatch events from your server without having to target specific element IDs in every AJAX request:

```html
<div x-sync id="server_events" role="alert">
  <div x-init="$dispatch('comment_added')">New comment created!</div>
</div>
```

Here's sudo code for how this could be designed to work on the server:

```js
// Server-side code

Session.server_events = new Array()
comment = new Comment({ body: Request.comment_body })
comment.saveToDatabase()
Session.server_events.push(new Event({ name: "comment_added", detail: comment, message: "New comment created!" }))

return new View("comments.template") with Session
```
```html
<!-- comments.template -->

<div x-sync id="server_events" role="alert">
  [ for event in Session.server_events ]
    <div x-init="$dispatch([ event.name ], [ event.detail ])">[ event.message ]</div>
  [ /for ]
</div>
```

## x-load

The `x-load` directive works just like Alpine's `x-init`, the only difference being that `x-load` will run each time a component is reloaded by an AJAX response. In contrast, `x-init` will only run the first time the component is initialized on the page.

Here we're using `x-load` to continuously poll for new data every second:

```html
<div x-load="setTimeout(() => $ajax('/progress'), 1000)">
  <label for="file">File progress:</label>
  <progress id="file" max="100" value="70">70%</progress>
</div>
```

Note that if we were to replace `x-load` with `x-init` in this markup, the polling request would only be issued once. See the [Progress Bar](/examples/progress-bar) example for a more complete demonstration.

## Loading states

While an AJAX request is in progress there are a few loading states to be aware of:

  * If a form submission triggered the request, the form's submit button is automatically disabled, this prevents users from triggering additional network requests by accidentally double clicking the submit button.
  * During an AJAX request, `aria-busy="true"` is set on all targets of the request. This attribute can be used in CSS to provide a loading indicator, check out the [Loading Indicator example](/examples/loading) for more details.

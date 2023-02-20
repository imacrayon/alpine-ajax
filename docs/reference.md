---
layout: layout.webc
---

# Reference

1. [x-ajax](#x-ajax)
    * [target](#target)
    * [noajax](#noajax)
    * [AJAX Events](#ajax-events)
    * [Progressive Enhancement](#progressive-enhancement)
3. [x-sync](#x-sync)
4. [x-load](#x-load)
5. [x-prefetch](#x-prefetch)
    * [noprefetch](#noprefetch)
6. [$ajax](#ajax)
    * [$ajax Options](#ajax-options)
    * [Server Events](#server-events)
7. [Loading States](#loading-states)

## x-ajax

This directive defines parts of a page to be updated on request. Any links and forms inside this element are captured, and the `x-ajax` element is automatically replaced after receiving a response. Regardless of whether the server provides a full document, or just a HTML fragment, only the `x-ajax` element will be extracted from the response to replace the existing content.

`x-ajax` elements must have a unique `id`. The `id` is used to match the content being replaced when requesting content from the server.

Consider this contact list entry:

```html
<div x-data x-ajax id="contact_1">
  <p><strong>First Name</strong>: Finn</p>
  <p><strong>Last Name</strong>: Mertens</p>
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit">Edit</a>
</div>
```

When the "Edit" link is clicked, the response should return a page for editing the contact entry:

```html
<h1>Edit Contact Details</h1>
<form x-data x-ajax id="contact_1" method="put" action="/contacts/1">
  <div>
    <label for="first_name">First Name</label>
    <input id="first_name" name="first_name" value="Finn">
  </div>
  <div>
    <label for="last_name">Last Name</label>
    <input id="last_name" name="last_name" value="Mertens">
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="fmertens@candykingdom.gov">
  </div>
  <button>Update</button>
</form>
```

Since the `<form>` in this response has a matching `contact_1` id. The original contact details will be replaced with the edit form. Notice that the page's `<h1>` isn't inside the `<form>`. This means it'll be ignored when the form replaces the contact details.

### target

Add the `target` attribute to target another element `id` on the page to be replaced instead of the `x-ajax` element.

Take a look at this comment list:

```html
<ul id="comments">
  <li>Comment #1</li>
</ul>
<h2 id="comment_form_title">Post a Comment</h2>
<form x-data x-ajax target="comments" method="post" action="/comment" aria-labelledby="comment_form_title">
  <input aria-label="Comment text" name="text" required />
  <button>Submit</button>
</form>
```

When the "Post a Comment" form is submitted the `comments` list will be updated with the response instead of the `x-ajax` form.

#### Defining Multiple Targets

You can even replace multiple elements from the same server response by separating `id`s with a space.

Here's an expanded comment list example:

```html
<h2>Comments (<span id="comments_count">1</span>)</h2>
<ul id="comments">
  <li>Comment #1</li>
</ul>
<h2 id="comment_form_title">Post a Comment</h2>
<form x-data x-ajax target="comments comments_count" method="post" action="/comment" aria-labelledby="comment_form_title">
  <input name="comment" required />
  <button>Submit</button>
</form>
```

Now, when the form is submitted, both the `comments` list, and the `comments_count` indicator will be updated.

### noajax

You can stop AJAX behavior on any element by adding the `noajax` attribute. Just like `x-ajax`, `noajax` is inherited by child elements.

Review this navigation that demonstrates `noajax` at work:

```html
<nav x-data x-ajax id="sidebar">
  <ul>
    <li><a noajax href="/page-1">Disabled</a></li>
    <li noajax><a href="/page-2">Disabled by parent</a></li>
    <li><a href="/page-3">AJAX enabled</a></li>
  </ul>
</nav>
```

 The first two links will behave like regular links, causing a full page reload when clicked. Only the third link will issue an AJAX request.

### AJAX Events

You can listen for AJAX events to perform additional actions during an AJAX request:

<table>
  <thead>
    <th scope="col" width="117">Name</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>ajax:before</code></td>
    <td>Fired before a network request is made. If this event is cancelled using <code>$event.preventDefault()</code> the request will be aborted.</td>
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
  </tbody>
</table>

Here's an example of aborting a form request when the user cancels a dialog prompt:

```html
<form x-data x-ajax id="delete_user" @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
  <button>Delete User</button>
</form>
```

**Note:** The `ajax:success` and `ajax:error` events only convey the status code of a request. You'll often find that using the [Server Events](#server-events) pattern is what you need to build more robust applications.

### Progressive Enhancement

Since AJAX enabled links no longer trigger full page navigation, they are transformed into buttons to meet [accessibility best practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#best_practices). AJAX links are given the `button` role, their `href` is removed, and the `<a>` element is wired to respond to button keyboard events.

Behavior added with `x-ajax` degrades gracefully if JavaScript is not enabled: Links and forms continue to work as normal, they simply don't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your sites functionality.

## x-sync

Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `target`.

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

You can lazy load content onto the page using the `x-load` directive:

```html
<div x-data x-load="/large-complex-chart" id="chart"></div>
```

This will issue a `GET` request to the server when the page loads, or as soon as this element is inserted into the DOM.

You can also specify a delay when loading content:

```html
<div x-data x-load.600ms="/progress">
  <label for="file">File progress:</label>
  <progress id="file" max="100" value="70">70%</progress>
</div>
```

This works great in situations where you may need to continuously poll the server for info on long running processes. See the [Progress Bar](/examples/progress-bar) example for a more complete demonstration.

## x-prefetch

Alpine AJAX can prefetch `GET` requests to speed up both page loading and rendering. To enable prefetching add `x-prefetch` to the `<body>` of your webpage:

```html
<body x-prefetch>
```

With prefetching enabled, Alpine AJAX will instantly start fetching a page in the background, as soon as a user hovers over a link. This head start in loading will make your user interface feel snappier.

**Warning:** If you have a link that performs a side effect on the server (like writing to the session or database), prefetching **will** executed these side effects unpredictably. It's best to keep your `GET` requests [idempotent](https://en.wikipedia.org/wiki/Idempotence) and [safe](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Safe_methods). In the event that you can't create a safe `GET` endpoint, you can disable prefetching on a link by adding the `noprefetch` attribute.

### noprefetch

You may disable prefetching on any link by adding the `noprefetch` attribute:

```html
<body x-prefetch>
  <a href="/write-to-database" noprefetch>I'm not prefetched</a>
</body>
```

## $ajax

You can use `$ajax` to programmatically issue AJAX requests triggered by events. Here we've wired it up to an input's `change` event to perform some server-side validation for an email:

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

### $ajax Options

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
    <td><code>sync</code></td>
    <td><code>false</code></td>
    <td>Setting this to <code>true</code> will include <code>x-sync</code> targets in the request.</td>
  </tr>
  </tbody>
</table>

### Server Events

Issuing AJAX requests in response to custom events is where the real magic happens, check out this markup for a list of comments:

```html
<ul x-data @comment_added.window="$ajax('/comments')" id="comments">
```

The comment list will listen for an event named `comment_added` to trigger on the root `window` object. When the `comment_added` event is triggered a `GET` request is issued to `/comments` and the comments list is reloaded with a fresh list of comments. Alpine makes it easy to dispatch custom events from any component using the `$dispatch` magic helper. You can trigger the `comment_added` event after a successful form submission by including markup like this in your server response:

```html
<script x-init="$dispatch('comment_added')"></script>
```

Combining `$ajax` with events rendered from the server provides a powerful pattern you can use to share server state between desperate parts of your interface. Let's break this pattern down with an example:

Imagine inside an app, after a comment is created, you would like to perform the following:
1. Display a notification message
2. Increment a comment count
3. Add the new comment to a listing of all comments
4. Close an open dialog somewhere in your UI
5. Load details related to the comment's author

You might be inclined to create a form that updates a big, ugly, list of targets like this:

```html
<form x-data x-ajax method="post" action="/comments" target="notifications comment_counter comments_list comment_dialog comment_author">
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

## Loading States

While an AJAX request is in progress there are a few loading states to be aware of:

  * If a form submission triggered the request, the form's submit button is automatically disabled, this prevents users from triggering additional network requests by accidentally double clicking the submit button.
  * During an AJAX request, `aria-busy="true"` is set on all targets of the request. This attribute can be used in CSS to provide a loading indicator, check out the [Loading Indicator example](/examples/loading) for more details.

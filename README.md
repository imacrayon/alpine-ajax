# Alpine AJAX Plugin

The Alpine AJAX plugin allows forms and internal links to make asynchronous HTTP requests and render the response to the page.

This is useful for creating dynamic interfaces that can submit forms or display remote content without a full page reload.

Here's a simple example with an explaination below:

```html
<form x-data x-ajax id="star-repo" method="post" action="/repos/1/star">
  <button>Star Repo</button>
</form>
```

When the `star-repo` form is submitted, the page will not reload. Instead, the form's response will be fetched in the background and the form will be swapped out with an element that has `id="star-repo"` in the response. Alpine component state and keyboard focus are preserved when content changes.

**It's important to note that an `id` is required on the form so that it can be located in the HTML response.**

## Installation

```bash
npm i @imacrayon/alpine-ajax
```

```js
import Alpine from 'alpinejs'
import ajax from '@imacrayon/alpine-ajax'

window.Alpine = Alpine
Alpine.plugin(ajax)
```

## Change the Replaced Target

By default, the element with `x-ajax` will be replaced with the new HTML. However, you may replace a different element by specifying its `id`.

```html
<!-- The "comments" container will be replaced when this form is submitted. -->
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-data x-ajax="comments" method="post" action="/post-comment">
  <input type="text" name="comment" required />
  <button>Post Comment</button>
</form>

<!--
On submit the server should respond with markup similar to this:

<ul id="comments">
  <li>Comment #1</li>
  <li>Comment #2</li>
</ul>

This markup will replace the old `#comments` list.
-->
```

You can even replace multiple elements from the same request by seperating `id`s with a space.

```html
<p id="comment-count">1</p>
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-data x-ajax="comments comment-count" method="post" action="/post-comment">
  <input type="text" name="comment" required />
  <button>Post Comment</button>
</form>

<!--
On submit the server should respond with markup similar to this:

<p id="comment-count">2</p>
<ul id="comments">
  <li>Comment #1</li>
  <li>Comment #2</li>
</ul>

This markup will replace both the old `#comments` list and the `#comment-count` element.
-->
```

## Add AJAX Behavior to a Group of Elements

All descentant links and forms of an `x-ajax` component will issue AJAX requests.

You can stop AJAX behavior on any element by adding the `noajax` attribute.

```html
<!-- The "tabs" container will be replaced when the "Tab 1" link is clicked. The "Tab 2" and "Tab 3" links will trigger a full page reload because "Tab 2" has the `noajax` attribute and "Tab 3" is an external URL. -->
<div x-data x-ajax id="tabs">
  <ul>
    <li><a href="/tab-1">Tab 1</a></li>
    <li><a noajax href="/tab-2">Tab 2</a></li>
    <li><a href="https://twitter.com/vampirebiues/status/1248738179232006146">Tab 3</a></li>
  </ul>
  <div>...</div>
</div>
```

## Events

You can listen for AJAX events to perform additional actions during an AJAX request:

Event Name | Description
---|---
ajax:before | Fired before the request is made. If this event is cancelled using `$event.preventDefault()` the request will be aborted.
ajax:success | Fired when a network request completes. `detail` contains the server response data.
ajax:error | Fired on a configuration or network error. `detail` contains the error data.
ajax:after | Fired after both successful and unsuccessful requests.

Here's an example of aborting a form request when the user cancels a dialog prompt:

```html
<form id="delete-user" x-data x-ajax @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
  <button>Delete User</button>
</form>
```

Here's an example of handling a failed network request:

```html
<form id="delete-user" x-data x-ajax @ajax:error="alert('Check your network connection and try again.')">
  <button>Delete User</button>
</form>
```

## Prior Art

* [HTMX](https://htmx.org)
* [Turbo Frames](https://turbo.hotwired.dev)
* [jQuery PJAX](https://pjax.herokuapp.com)

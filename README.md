# Alpine AJAX

A set of AlpineJS utilities that enable forms and links to make asynchronous HTTP requests and render the response to the page.

With a just a few tools you can create complex, dynamic interfaces that can handle forms or display remote content without performing a full page reload.

Here's a simple example with an explanation below:

```html
<form x-data x-ajax id="star-repo" method="post" action="/repos/1/star">
  <button>Star Repo</button>
</form>
```

When the `star-repo` form is submitted, the page will not reload. Instead, the form's response will be fetched in the background and the form will be swapped out with an element that has `id="star-repo"` in the server's response. Alpine component state and keyboard focus are all preserved when any content is swapped.

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

By default, the element with `x-ajax` will be replaced with the new HTML that comes from the server. However, you may replace a different element using `x-target` and an element `id`.

```html
<!-- The "comments" container will be replaced when this form is submitted. -->
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-data x-ajax x-target="comments" method="post" action="/post-comment">
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

You can even replace multiple elements from the same request by separating `id`s with a space.

```html
<p id="comment-count">1</p>
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-data x-ajax x-target="comments comment-count" method="post" action="/post-comment">
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

All descendant links and forms of an `x-ajax` component will issue AJAX requests.

You can stop AJAX behavior on any element by adding the `noajax` attribute.

```html
<!-- The "tabs" container will be replaced when the "Tab 1" link is clicked. The "Tab 2" and "Tab 3" links will trigger a full page reload because "Tab 2" has the `noajax` attribute and "Tab 3" is an external URL. -->
<div x-data x-ajax id="tabs">
  <ul>
    <li><a href="/tab-1">Tab 1</a></li>
    <li><a noajax href="/tab-2">Tab 2</a></li>
    <li><a href="https://twitter.com/vampirebiues/status/1248738179232006146">Tab 3</a></li>
  </ul>
</div>
```

## AJAX Link Accessibility

This plugin will progressively enhance all AJAX enabled links into `buttons` to meet [accessibility best practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#best_practices). AJAX links are given the `button` role, their `href` is removed, and the `<a>` element is wired to respond to button keyboard events.

## AJAX Events

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

## Synchronize Content with the Server

Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `x-target`.

Use cases for this are unread message counters or notification flashes. These elements often live in the base layout, outside of the content area that is being replaced.

```html
<!-- Every server response with a #notifications element will get inserted here. -->
<div aria-live="polite">
  <ul x-sync id="notifications"></ul>
</div>
```

## Lazy Load Content

You can lazy load an element on the page using the `x-load` directive.

```html
<div x-data x-ajax x-load="/large-complex-chart" id="chart"></div>
```
The code above will load a chart component on page load.

You can also wait to lazily load content until an event is fired:

```html
<div x-data x-ajax x-load:comment_updated="/comments" id="comments"></div>
```
The code above listens for an event named `comment_updated` on the root `window` object. When the `comment_updated` event is triggered `#comments` will be replaced with fresh content.

**Tip:** Alpine makes it easy to dispatch events from any component using the `$dispatch` magic helper. You could trigger the event in the previous example with a server response like this:

```html
<script x-init="$dispatch('comment_updated')"></script>
<!-- ...other HTML from the server -->
```

Combining `x-load` with events sent from the server provides a powerful pattern you can use to control dependencies and interactions between desparate parts of your interface. Instead of updating multiple pieces of a complex page in a singe request, include a single event `script` along with a form response and elements on the page will handle updating their own content independently.

## Prior Art

* [HTMX](https://htmx.org)
* [Turbo Frames](https://turbo.hotwired.dev)
* [jQuery PJAX](https://pjax.herokuapp.com)

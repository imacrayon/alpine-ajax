# Alpine AJAX

The `x-ajax` directive allows forms and internal links to make asynchronous HTTP requests and render the response to the page.

Here's a simple example:

```html
<form x-ajax id="star-repo-form" method="post" action="/repos/1/star">
  <button>Star Repo</button>
</form>
```
When this form is submitted a page refresh will not occur. Instead, the response will be fetched in the background and the form will be swapped out with the element that has `id="star-repo-form"` in the response.

It's important to note that the `id` attribute is required on the element that will be replaced.

## Installation

```bash
npm i @imacrayon/alpine-ajax
```

```js
import Alpine from 'alpinejs'
import ajax from '@imacrayon/alpine-ajax'

Alpine.plugin(ajax)
```

## Configuration

### Change the Replaced Target

By default, the element with `x-ajax` will be replaced with the response. You can use another element instead by specifying its `id`.

```html
<!-- The "comments" container will be replaced when this form is submitted. -->
<ul id="comments">
  <li>Comment #1</li>
</ul>
<form x-ajax="comments" method="post" action="/post-comment">
  <input type="text" name="comment" required />
  <button>Post Comment</button>
</form>

<!--
On submit the server should respond with markup similar to this:

<ul id="comments">
  <li>Comment #1</li>
  <li>Comment #2</li>
</ul>

The markup will replace the old `#comments` list.
-->

```

### Require Confirmation

You may show a `confirm()` dialog before an AJAX request is made. If the dialog is canceled the request will not be issued.

```html
<form x-ajax ajax-confirm="Are you sure?" id="delete-comment-form" method="delete" action="/delete-comment">
  <button>Delete Comment</button>
</form>
```

### Add AJAX Behavior to a Group of Elements

When the `x-ajax` directive is added to an element that is not an internal link or form, all child links and forms will issue AJAX requests.

You can disable AJAX behavior for element using the `ajax-ignore` attribute.

```html
<!-- The "tabs" container will be replaced when the "Link 1" link is clicked. The "Link 2" and "Link 3" links will trigger a full page reload. -->
<div x-ajax id="tabs">
  <ul>
    <li><a href="/link1">Link 1</a></li>
    <li><a ajax-ignore href="/link2">Link 2</a></li>
    <li><a href="https://twitter.com/vampirebiues/status/1248738179232006146">Link 3</a></li>
  </ul>
  <div>...</div>
</div>
```

## Events

When an AJAX request is triggered it emits a few events which you can hook into.

Event Name | Description
---|---
ajax:before | Fired before the request is made.
ajax:success | Fired on a successful request.
ajax:error | Fired when a non 200 status code is received.
ajax:after | Fired after both successful and unsuccessful requests.

Here's an example of loading remote content into a model using the `ajax:before` event:

```html
<!-- The open/close state of the modal is kept in an Alpine store named `userModal` -->
<script>Alpine.store('userModal', false)</script>

<ul x-ajax="user-info" @ajax:before="$store.userModal = true">
  <a href="/users/1">User #1</a>
  <a href="/users/2">User #2</a>
  <a href="/users/3">User #3</a>
</ul>

<div x-data x-show="$store.userModal">
  <div id="user-info">Loading...</div>
  <button @click="$store.userModal = false">Close Modal</button>
</div>

<!--
When clicking the `User #1` link the server should respond with markup similar to this:

<div id="user-info">
  <h1>User #1</h1>
  ...
</div>

The markup will be inserted into the now visible modal.
-->

```

## Prior Art

* [HTMX](https://htmx.org)
* [Turbo Frames](https://turbo.hotwired.dev)
* [jQuery PJAX](https://pjax.herokuapp.com)

---
eleventyNavigation:
  key: x-target
  url: /reference/#x-target
  order: 3
---

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

`x-target` can replace multiple elements from a single server response by separating `id`s with a space.

In this comment list example note that the `x-target` attribute on the `<form>` targets two elements:

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

### Target aliases

In situations where an element ID on the current page cannot be made to match an element ID in an AJAX response, you may specify a target alias by separating two IDs with a colon:

```html
<a x-target="modal_body:page_body">Load modal</a>
<div id="modal_body"></div>
```

In this example, when the link is clicked, `#modal_body` will be replaced with the `#page_body` element in the incoming AJAX request.

### Targets based on response status code

Add a status code modifier to `x-target` to define different targets based on the status code received in an AJAX response:

* `x-target.422="my_form"` merge content when the response has a 422 status code.
* `x-target.4xx="my_form"` merge content when the response has a 400 class status code (400, 403, 404, etc.).
* `x-target.back="my_form"` merge content when the response is redirected **back** to the same page.
* `x-target.away="my_form"` merge content when the response is redirected **away** to a different page.
* `x-target.error="my_form"` merge content when the response has a 400 or 500 class status codes.

Consider this login form:

```html
<form x-target="login" x-target.away="_top" id="login" method="post" action="/login">
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  ...
  <button>Submit</button>
</form>
```

When this form is submitted, all responses - such as validation errors - will render inside `#login` without a full page refresh. Once a login attempt is successful, the user will be redirected to a secure page via a full page reload.

Here is an example using multiple targets with the `back` modifier:

```html
<form x-target="todo_list add_todo_form" x-target.back="add_todo_form" id="add_todo_form" method="post" action="/todos">
  <label for="task">Task</label>
  <input id="task" name="task">
  <button>Add</button>
</form>

<ul id="todo_list">
  ...
</ul>
```

When this form is submitted, validation errors will only target the `#add_todo_form`, but on a successful submission, both the `#add_todo_form` and `#todo_list` will be updated.

#### An important note about redirect (300 class) status codes

[The JavaScript Fetch API follows all redirects transparently](https://blog.jim-nielsen.com/2021/fetch-and-3xx-redirect-status-codes/), so Alpine AJAX cannot distinguish between 300 class status codes. This means all 300 class modifiers will capture any redirect response, for example, `x-target.302` will also handle 301 & 303 redirects.

### Special targets

The following target keywords have special meaning:

* `_top` instructs an element to trigger a full page reload.
* `_none` instructs an element to do nothing.
* `_self` _(deprecated in 0.12.0)_ instructs an element to trigger a full page reload, except when the response is redirected back to the same page.<br>_Use `x-target.away="_top"` instead_.

In cases when a form or link targets itself, you may leave the value of `x-target` blank, however the form or link must still have an `id`:

```html
<form x-target id="star_repo" method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

[Target aliases](#target-aliases) can use the shorthand syntax too (note the `:` prefix):

```html
<form x-target=":alias_id" id="star_repo" method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

### Dynamic target names

Sometimes simple target literals (i.e. comment_1) are not sufficient. In these cases, `x-target:dynamic` allows you to dynamically generate target IDs using Alpine data and JavaScript expressions:

```html
<template x-for="comment in comments" :key="comment.id">
  <li :id="'comment_'+comment.id">
    <div>{{ comment.body }}</div>
    <form x-target:dynamic="'comment_'+comment.id" :action="'/comments/'+comment.id" method="post">
      <button>Edit</button>
    </form>
  </li>
</template>
```

### Updating the URL

Use the `x-target.url` modifier to replace the URL in the browser's navigation bar when an AJAX request is issued.

### Disable AJAX per submit button

In cases where you have a form with multiple submit buttons, you may not always want all submit buttons to trigger an AJAX request. Add the `formnoajax` attribute to a submit element to instruct the form to make a standard full-page request instead of an AJAX request.

```html
<form id="checkout" x-target method="post" action="/checkout">
  <button name="procedure" value="increment">Increment quantity</button>
  <button name="procedure" value="decrement">Decrement quantity</button>
  <button formnoajax name="procedure" value="purchase">Complete checkout</button>
</form>
```

In this example clicking "Increment" or "Decrement" will issue an AJAX request. Clicking "Complete Checkout" will perform a standard form submission.

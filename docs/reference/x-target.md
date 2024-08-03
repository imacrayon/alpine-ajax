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
<form x-init x-target="comments" method="post" action="/comment">
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
<form x-init x-target="comments comments_count" method="post" action="/comment">
  <input name="comment" required />
  <button>Submit</button>
</form>
```

Now, when the form is submitted, both the `#comments` list, and the `#comments_count` indicator will be updated.

### Targets based on response status code

Add a status code modifier to `x-target` to define different targets based on the status code received in an AJAX response:

* `x-target.422="my_form"` will merge content only when a response has a 422 status code.
* `x-target.4xx="my_form"` will merge content only when a response has a 400 class status code.
* `x-target.error="my_form"` will merge content for both 400 and 500 class status codes.

When using status code modifiers you can instruct Alpine AJAX to perform a full page load by setting the target to `_self`. <span id="_self-special-exception">However, this has one special exception:</span> When `_self` is used in combination with a 3xx status code, it will **not** trigger a full page load on redirects back to the current page. This behavior means that your forms can still redirect back to the same page to show validation errors and eventually redirect away to a new location when all input is valid. If you want to trigger a full page reload no matter what status code you get in the response, you can set the target to `_top` instead.


#### An important note about redirect (3xx class) status codes

[The JavaScript Fetch API follows all redirects transparently](https://blog.jim-nielsen.com/2021/fetch-and-3xx-redirect-status-codes/). This means there's no way for Alpine AJAX to distinguish between 3xx class status codes, to work around this limitation, we've made it so that all 3xx class modifiers will capture all redirect responses, essentially, `x-target.302` will also handle 301 & 303 redirects.

Consider this contrived form for publishing a new blog post:

  ```html
  <div id="notifications"></div>
  <div id="not_found"></div>
  <div id="other_error"></div>
  <div id="critical_error"></div>
  <form x-init
        x-target.5xx="critical_error"
        x-target.404="not_found publish_form"
        x-target.error="other_error"
        x-target.302="_self"
        x-target="publish_form"
        id="publish_form"
        method="post"
        action="/publish"
  >
    <label for="content">Post title</label>
    <input id="title" name="title" required />
    ...
    <button>Publish</button>
  </form>
  ```
There's a lot of status modifiers in this markup so let's break it all down; when the form is submitted:

* Any 5xx class status code will target `critical_error`.
* A 404 status code will target `not_found` **and** `publish_form`.
* All other 4xx class status codes will target `other_error` (thanks to `x-target.error`).
* Any 3xx class status code redirecting to a different page will load the redirected URL in the browser window (See [important note about redirects](#an-important-note-about-redirect-3xx-class-status-codes).)
* Any 3xx class status code redirecting back to the current page will target `publish_form`   (See [the `_self` special exception](#_self-special-exception).)
* All other response status codes will target `publish_form`.

### Target shorthand

In cases when a form or link targets itself, you may leave the value of `x-target` blank, however the form or link must still have an `id`:

```html
<form x-init x-target id="star_repo" method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

### Dynamic target names

Sometimes simple target literals (i.e. comment_1) are not sufficient. In these cases, `x-target:dynamic` allows you to dynamically generate target IDs using Alpine data and JavaScript expressions:

```html
<template x-for="comment in comments" :key="comment.id">
  <li :id="'comment_'+comment.id">
    <div>{{ comment.body }}</div>
    <form x-init x-target:dynamic="'comment_'+comment.id" :action="'/comments/'+comment.id" method="post">
      <button>Edit</button>
    </form>
  </li>
</template>
```

### History & URL Support

Use the `x-target.replace` modifier to replace the URL in the browser's navigation bar when an AJAX request is issued.

Use the `x-target.push` modifier to push a new history entry onto the browser's session history stack when an AJAX request is issued.

`replace` simply changes the browser’s URL without adding a new entry to the browser’s session history stack, where as `push` creates a new history entry allowing your users to navigate back to the previous URL using the browser’s "Back" button.

### Disable AJAX per submit button

In cases where you have a form with multiple submit buttons, you may not always want all submit buttons to trigger an AJAX request. Add the `formnoajax` attribute to a submit element to instruct the form to make a standard full-page request instead of an AJAX request.

```html
<form id="checkout" x-init x-target method="post" action="/checkout">
  <button name="procedure" value="increment">Increment quantity</button>
  <button name="procedure" value="decrement">Decrement quantity</button>
  <button formnoajax name="procedure" value="purchase">Complete checkout</button>
</form>
```

In this example clicking "Increment" or "Decrement" will issue an AJAX request. Clicking "Complete Checkout" will perform a standard form submission.

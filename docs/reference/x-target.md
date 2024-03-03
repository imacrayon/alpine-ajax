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

### Target shorthand

In cases when a form or link targets itself, you may leave the value of `x-target` blank, however the form or link must still have an `id`:

```html
<form x-init x-target id="star_repo" method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

### Handling redirects

AJAX requests issued by `x-target` will transparently follow redirects without reloading the browser window. You may use the `x-target.nofollow` modifier to force the browser to reload when the server responds with a redirect. Notice the `nofollow` modifier used on this form for creating a new blog post:

```html
<form x-init x-target.nofollow id="create_post" method="post" action="/posts">
  <label for="content">Post title</label>
  <input id="title" name="title" required />
  <label for="content">Post content</label>
  <input id="content" name="content" required />
  <button>Publish</button>
</form>
```

When this form is submitted a `POST` request is issued to `/posts`. If the server responds with a `302` redirect to the newly created blog post at `/posts/1`, the browser will preform a full page reload and navigate to `/posts/1`.

You can change the default way that `x-target` handles redirects using the `followRedirects` global [configuration option](#configuration).

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

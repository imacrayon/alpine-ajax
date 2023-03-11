---
layout: layout.webc
---

# Alpine AJAX

The missing [Alpine.js](https://alpinejs.dev) attributes for interacting with your server. It's `jQuery.ajax()` for the modern web.

Alpine AJAX empowers you to progressively enhanced multi-page websites to create fast, responsive web experiences with very little JavaScript.

## An Introduction

Consider this simple form:

```html
<form method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

When this form is submitted a `POST` request is issued to `/repos/1/star` and the content from the response is loaded into the browser window.

Now let's enhance this form with Alpine AJAX:

```html
<form x-ajax id="star_repo" method="post" action="/repos/1/star">
```

Adding `x-ajax` and `id` changes this form's behavior: Now, when this form is submitted, a `POST` request is issued to `/repos/1/star` and the form is replace with the element that has the `id` `star_repo` in the response's content. The browser window doesn't refresh, and UI state (like keyboard focus) is preserved when the content changes.

This simple pattern of updating a piece of your frontend instead of the entire page can be expanded to create rich user experiences.

Visit the [Reference](/reference) page to learn how Alpine AJAX works, and then check the [Examples](/examples) page to learn how to apply it.

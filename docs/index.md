---
layout: layout.webc
---

# Alpine AJAX

Alpine AJAX seamlessly integrates your client and server using [Alpine.js](https://alpinejs.dev). Use it to build straight-forward, robust, interactive websites.

- **Alpine AJAX is small**: Under 4kB (gzipped), combined with Alpine.js you can build [almost anything you want](/examples) with only 18kB of total JavaScript.
- **Alpine AJAX is flexible**: It has zero server-side dependencies, you can use it with _any_ server-side stack.
- **Alpine AJAX is progressive**: It provides patterns for building progressively enhanced websites that function even [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html).
- **Alpine AJAX is accessible**: It uses JavaScript to _enhance_ [the power of HTML](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML) rather than replace it with inaccessible workarounds.
- **Alpine AJAX is performant**: It batches AJAX requests and prevents duplicate requests to save you network bandwidth.
- **Alpine AJAX is easy to learn**: You can probably pick it up in an afternoon.

## How it works

Consider this simple form:

```html
<form method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

It's ordinary HTML – when this form is submitted a `POST` request is issued to `/repos/1/star` and the content from the response is loaded into the browser window.

Now let's enhance this form with Alpine AJAX:

```html
<form x-target="star_repo" id="star_repo" x-arrange="morph" method="post" action="/repos/1/star">
```
These three new attributes change this form's behavior:

1. `x-target` instructs the form to target the element on the page assigned `id="star_repo"` (itself in this example). When the form is submitted it will issue an AJAX request instead of a standard browser request. The `#star_repo` form will then be replaced with the element that has `id="star_repo` in the AJAX request's response.
3. `x-arrange` instructs the incoming `#star_repo` element to "morph" itself into the existing DOM so that keyboard focus and DOM state are preserved when the HTML changes.

This simple pattern of updating a piece of your frontend instead of the entire page can be expanded to create rich user experiences, and because we're building these patterns on top of semantic HTML we get to leverage the resilience and accessibility of HTML without complex workarounds.

## Next steps

Jump to the [Reference](/reference) to get started, then check the [Examples](/examples) for more details on implementing specific patterns.

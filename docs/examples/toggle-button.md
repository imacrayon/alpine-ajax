---
title: Toggle Button
eleventyNavigation:
  key: Toggle Button
  excerpt: The classic “Like” toggle button.
  order: 1
---

This demo shows how to implement a toggle button that alters server state.

This pattern starts with an AJAX form assigned `id="like"`:

```html
<form id="like" x-init x-target method="post" action="/comments/1/like">
  <button name="user_id" value="1">Like</button>
</form>
```

When the form is submitted, a `POST` request is issued to the server, and the server will return a new form state:

```html
<form id="like" x-init x-target method="delete" action="/comments/1/like">
  <button name="user_id" value="1" x-autofocus>Unlike</button>
</form>
```

The `x-autofocus` attribute ensures that keyboard focus is preserved between state changes. Try out the following demo, note that when the button is toggled using the keyboard, focus stays consistent:

<script type="module">
window.route('GET', '/comments', () => view(false))
window.route('POST', '/comments/1/like', () => view(true))
window.route('DELETE', '/comments/1/like', () => view(false))

window.example('/comments')

function view(liked) {
  return `<form id="like" x-init x-target method="${liked ? 'delete' : 'post'}" action="/comments/1/like">
<button name="user_id" value="1" x-autofocus>${liked ? 'Unlike' : 'Like'}</button>
</form>`
}
</script>

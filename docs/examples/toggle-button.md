---
layout: example.webc
title: Toggle Button
---

This demo shows how to implement a toggle button that alters server state.

This pattern starts with an AJAX form assigned `id="like"`:

```html
<form x-ajax id="like" method="post" action="/comments/1/like">
  <button name="user_id" value="1">Like</button>
</form>
```

When the form is submitted, a `POST` request is issued to the server, and the server will return a new button state:

```html
<form x-ajax id="like" method="delete" action="/comments/1/like">
  <button name="user_id" value="1">Unlike</button>
</form>
```

Note that when this button is toggled using the keyboard, focus is retained between UI updates.

<script>
  window.route('GET', '/comments/1/like', () => view(false))
  window.route('POST', '/comments/1/like', () => view(true))
  window.route('DELETE', '/comments/1/like', () => view(false))

  example('/comments/1/like')

  function view(liked) {
    return `<form x-ajax id="like" method="${liked ? 'delete' : 'post'}" action="/comments/1/like">
  <button name="user_id" value="1">${liked ? 'Unlike' : 'Like'}</button>
</form>`
  }
</script>

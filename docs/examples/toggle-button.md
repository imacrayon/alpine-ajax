---
layout: example.webc
title: Toggle Button
---

This demo shows how to implement a toggle button that alters server state.

This pattern starts with a simple form:

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
  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /comments/1/like': () => view(false),
      'POST /comments/1/like': () => view(true),
      'DELETE /comments/1/like': () => view(false),
    }).get('/comments/1/like')
  })

  function view(liked) {
    return `<form x-ajax id="like" method="${liked ? 'delete' : 'post'}" action="/comments/1/like">
  <button name="user_id" value="1">${liked ? 'Unlike' : 'Like'}</button>
</form>`
  }

</script>

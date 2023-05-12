---
layout: example.webc
title: Server Events
---

This example demonstrates how you can configure AJAX Components to respond to events that occur on your server. Alpine already provides a pattern for communicating between components using an [event listener on the `window` object](https://alpinejs.dev/essentials/events#listening-for-events-on-window). We can use this same pattern to also communicate from the server to any component on the page. Consider this list of comments followed by a comment form:

```html
<ul x-init @comment:created.window="$ajax('/comments')" id="comments">
  ...
</ul>

<div x-sync id="server_events"></div>

<form id="comment_form" x-target method="post" action="/comments">
  <label for="comment_body">
  <textarea id="comment_body" name="comment_body"></textarea>
  <button>Submit</button>
</form>
```

Notice that the comment form does not explicitly target the comment list. Instead, we want to decouple the form and the comment list behavior. The form will be in charge of updating it's own state after a submission, and the comment list will be in charge of adding new comments when a comment is created on the server.

To this end we've add an custom event listener to the comment list. The comment list is listening for an event named `comment:created` to trigger on the root `window` object. When the `comment:created` event is triggered, a `GET` request is issued to `/comments`, and the comments list is reloaded with a fresh list of comments.

We've also included a placeholder element on the page assigned `id="sever_events"`. This placeholder will act as an event bus for our server events. We've included the `x-sync` attribute on this element so that we can easily push content into it without explicitly targeting it in an AJAX requests.

Next, when our comment form is submitted the server will respond with a new server event and a fresh comment form:

```html
<div x-sync id="server_events">
  <div x-init="$dispatch('comment:created')"></div>
</div>

<form id="comment_form" x-target method="post" action="/comments">
  <label for="comment_body">
  <textarea id="comment_body" name="comment_body"></textarea>
  <button>Submit</button>
</form>
```

The `<div>` with `x-init` will immediately dispatch a `comment:created` event as soon as it is rendered to the page. Subsequently, the `comment:created` event will cause our comment list to refresh itself via its own event listener.

## Making the experience more accessible

At this point our comment form is working with a mouse, but we need to also consider what the experience is like for users who might use a keyboard or assistive technology like a screen reader. There are two major problems with our implementation so far:

  1. After a comment is submitted there is no clear indication that a comment was created for visually impaired users.
  2. After a comment is submitted keyboard focus is removed from the page.

We can solve both of this issues by adding with only a few tweaks:

To address the first issue, we'll include a message in our new server event and wrap the `#server_events` component in a `status` element so that the message can be automatically discovered up by assistive technologies:

```html
<div role="status" aria-live="polite">
  <div x-sync id="server_events">
    <div x-init="$dispatch('comment:created')">Your comment was added!</div>
  </div>
</div>
```

Next, we'll add an `x-focus` attribute to our form, so that we can return focus back to the comment `<textarea>` after a comment is posted:

```html
<form id="comment_form" x-target x-focus="comment_body" method="post" action="/comments">
```

<script>
  let database = function () {
    let data = [];
    return {
      save: (body) => {
        return data.push({id: data.length, body })
      },
      all: () => data,
    }
  }()

  window.route('GET', '/comments', () => index(database.all()))
  window.route('POST', '/comments', (input) => {
    database.save(input.comment_body)
    return create('comment:created')
  })
  example('/comments')

  function serverEvent(name = '') {
    let event = name ? `<div x-init="$dispatch('${name}')" style="color:#008800">Your comment was added!</div>` : ''

    return `<div role="status" aria-live="polite">
  <div x-sync id="server_events">${event}</div>
</div>`
  }

  function index(comments) {
    let items = comments.map(comment => `<li key="${comment.id}">${comment.body}</li>`).join('')
    items = items || '<li>No comments</li>'

    return `<ul x-data @comment:created.window="$ajax('/comments')" id="comments">${items}</ul>
${serverEvent()}
<form id="comment_form" x-target x-focus="comment_body" method="post" action="/comments">
  <label for="comment_body">Comment</label>
  <textarea id="comment_body" name="comment_body"></textarea>
  <button>Submit</button>
</form>`
  }
  function create(event) {
    return `${serverEvent(event)}
<form id="comment_form" x-target x-focus="comment_body" method="post" action="/comments">
  <label for="comment_body">Comment</label>
  <textarea id="comment_body" name="comment_body"></textarea>
  <button>Submit</button>
</form>`
  }
</script>

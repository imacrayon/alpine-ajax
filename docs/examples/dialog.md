---
layout: example.webc
title: Dialog (Modal)
---

This example shows how to load remote content into a dialog window.

We start an empty `<dialog>` and a list of links that target the `<dialog>`.

```html
<ul x-data x-ajax target="contact" @ajax:before="$dispatch('dialog:open')">
  <li><a href="/contacts/1">Finn Mertins</a></li>
  ...
<ul>

<dialog x-data @dialog:open.window="$el.showModal()">
  <div id="contact"></div>
</dialog>
```

Clicking a link issues a `GET` request to the server and triggers the `ajax:before` event. When the `ajax:before` event is triggered we dispatch a `dialog:open` event.

The `<dialog>` is set to listen for `dialog:open` and will open when that event is fired.

Finally, the server responds with the modal content:

```html
<div id="contact">
  <p><strong>First Name</strong>: Finn</p>
  <p><strong>Last Name</strong>: Mertens</p>
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>
  <p><strong>Status</strong>: Active</p>
</div>
```

<style>
  dialog {
    border: none;
    border-radius: .5rem;
    box-shadow: 0 10px 15px -3px var(--shadow), 0 4px 6px -4px var(--shadow);
    padding: 1rem;
    max-width: 56ch;
    position: fixed;
    top: 50vh;
    margin-left: auto;
    margin-right: auto;
    transform: translate(0, -50%);
  }
</style>

<script>
  var database = function () {
    let data = [
      { id: 1, name: "Finn Mertins", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake the Dog", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@moco.com", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      find: (id) => data.find(contact => contact.id === parseInt(id)),
      all: () => data,
    }
  }()

  document.addEventListener('DOMContentLoaded', () => {
    let routes = {
      'GET /contacts': () => index(database.all()),
    }
    database.all().forEach(contact => {
      routes[`GET /contacts/${contact.id}`] = () => show(database.find(contact.id))
    })
    window.server(routes).get('/contacts')
  })

  function index(contacts) {
    let items = contacts.map(contact => `<li><a href="/contacts/${contact.id}">${contact.name}</a>`).join('\n')
    return `<ul x-data x-ajax target="contact" @ajax:before="$dispatch('dialog:open')">
  ${items}
</ul>
<dialog @dialog:open.window="$el.showModal()">
  <div id="contact"></div>
  <form method="dialog" novalidate><button>Close</button></form>
</dialog>`
  }

  function show(contact) {
    return `<div id="contact">
  <p><strong>Name</strong>: ${contact.name}</p>
  <p><strong>Email</strong>: ${contact.email}</p>
  <p><strong>Status</strong>: ${contact.status}</p>
</div>`
  }
</script>

---
title: Dialog (Modal)
eleventyNavigation:
  key: Dialog (Modal)
  excerpt: Load remote content in a dialog window.
  order: 11
---

This example shows how to load remote content into a dialog window.

We start an empty `<dialog>` and a list of links that target the `<dialog>`.

```html
<ul x-init @ajax:before="$dispatch('dialog:open')">
  <li><a href="/contacts/1" x-target="contact">Finn Mertins</a></li>
  ...
<ul>

<dialog x-init @dialog:open.window="$el.showModal()">
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

<script type="module">
  var database = function () {
    let data = [
      { id: 1, name: "Finn Mertins", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake the Dog", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@mo.co", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      find: (id) => data.find(contact => contact.id === parseInt(id)),
      all: () => data,
    }
  }()

  window.route('GET', '/contacts', () => index(database.all()))
  database.all().forEach(contact => {
    window.route('GET', `/contacts/${contact.id}`, () => show(database.find(contact.id)))
  })

  window.example('/contacts')

  function index(contacts) {
    let items = contacts.map(contact => `<li><a href="/contacts/${contact.id}" x-target="contact">${contact.name}</a>`).join('\n')
    return `<ul x-init @ajax:before="$dispatch('dialog:open')">
  ${items}
</ul>
<dialog x-init @dialog:open.window="$el.showModal()">
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

---
title: Dialog (Modal) Form
eleventyNavigation:
  key: Dialog (Modal) Form
  excerpt: Handle forms inside a dialog window.
  order: 16
---

This example shows how to handle forms within a dialog window.

We start with an empty `<dialog>` and a `<table>` of contact data.

```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
      <th scope="col">Email</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
  <tbody id="contacts" x-init @ajax:before="$dispatch('dialog:open')" @contact:updated.window="$ajax('/contacts')">
    ...
  </tbody>
</table>

<dialog x-init @dialog:open.window="$el.showModal()" @contact:updated.window="$el.close()">
  <div id="contact"></div>
</dialog>
```

Notice that the `<tbody>` has an `id` and is listening for two events:
  1. When the `ajax:before` event is triggered we dispatch a `dialog:open` event.
  2. When the `contact:updated` event is triggered we issue a `GET` request to `/contacts` and refresh the `<tbody>` to match the server.

The `<dialog>` is also listening for two events:
  1. When the `dialog:open` event is triggered the dialog will open.
  2. When the `contact:updated` event is triggered the dialog with close.

Here is the HTML for a table row:

```html
<tr>
  <td>Finn Mertins</td>
  <td>Active</td>
  <td>fmertins@candykingdom.gov</td>
  <td><a href="/contacts/1/edit" x-target="contact">Edit</a></td>
</tr>
```

In each table row we have an "Edit" link targeting the empty `#contact` `<div>` inside our `<dialog>`.

Clicking the "Edit" link issues a `GET` request to `/contacts/1/edit` which returns the corresponding `<form>` for the contact inside the `<dialog>`:

```html
<form id="contact" x-target method="put" action="/contacts/1" aria-label="Contact Information">
  <div>
    <label for="name">Name</label>
    <input id="name" name="name" value="Finn">
  </div>
  <div>
    <label for="status">Status</label>
    <select id="status" name="status">
      <option value="Active" selected>Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="fmertins@candykingdom.gov">
  </div>
  <button>Update</button>
</form>
```

Notice the `<form>` has the `x-target` attribute so that both success and error responses are rendered within the `<dialog>`.

When the `<form>` is submitted, a `PUT` request is issued to `/contacts/1` and the server responds with an updated form and a `contact:updated` event:

```html
<form id="contact" x-target method="put" action="/contacts/1" aria-label="Contact Information">
  <div x-init="$dispatch('contact:updated')"></div>
  ...
</form>
```

Finally, the `contact:updated` event from the server causes the `<tbody>` to refresh with the updated contact data and dialog to close.

<script type="module">
  var database = function () {
    let data = [
      { id: 1, name: "Finn Mertins", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake the Dog", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@mo.co", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ]

    return {
      find: (id) => data.find(contact => contact.id === parseInt(id)),
      update: (id, changes) => {
        let index = data.findIndex(contact => contact.id === parseInt(id))
        if (index !== -1) {
          data[index] = Object.assign(data[index], changes)
        }
      },
      all: () => data,
    }
  }()

  window.route('GET', '/contacts', () => index(database.all()))
  database.all().forEach(contact => {
    window.route('GET', `/contacts/${contact.id}/edit`, () => edit(database.find(contact.id)))
    window.route('PUT', `/contacts/${contact.id}`, (input) => {
      database.update(contact.id, input)

      return edit(database.find(contact.id), 'contact:updated')
    })
  })

  window.example('/contacts')

  function index(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td>${contact.name}</td>
  <td>${contact.status}</td>
  <td>${contact.email}</td>
  <td><a href="/contacts/${contact.id}/edit" x-target="contact">Edit</a></td>
</tr>`).join('\n')
    return table(rows)
  }

  function edit(contact, event = '') {
    return `<form id="contact" x-target method="put" action="/contacts/${contact.id}" aria-label="Contact Information">
    ${serverEvent(event)}
    <div>
      <label for="name">Name</label>
      <input id="name" name="name" value="${contact.name}">
    </div>
    <div>
      <label for="status">Status</label>
      <select id="status" name="status">
        <option value="Active" ${contact.status == 'Active' ? 'selected' : ''}>Active</option>
        <option value="Inactive" ${contact.status == 'Inactive' ? 'selected' : ''}>Inactive</option>
      </select>
    </div>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" value="${contact.email}">
    </div>
    <button>Update</button>
  </form>`
  }

  function serverEvent(name = '') {
    return name ? `<div x-init="$dispatch('${name}')"></div>` : ``
  }

  function table(rows) {
    return `<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
      <th scope="col">Email</th>
      <th scope="col" width="53">Action</th>
    </tr>
  </thead>
  <tbody id="contacts" x-init @ajax:before="$dispatch('dialog:open')" @contact:updated.window="$ajax('/contacts')">
    ${rows}
  </tbody>
</table>
<dialog x-init @dialog:open.window="$el.showModal()" @contact:updated.window="$nextTick(() => $el.close())">
  <form method="dialog" novalidate><button>&times;</button></form>
  <div id="contact"></div>
</dialog>`
  }
</script>

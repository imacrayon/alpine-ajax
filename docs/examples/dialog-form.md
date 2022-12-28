---
layout: example.webc
title: Dialog (Modal) Form
---

This example shows how to handle forms within a dialog window.

We start with an empty `<dialog>` and a `<table>` of contact data.

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody x-data x-ajax id="contacts" @ajax:before="$dispatch('dialog:open')" x-load:contact:updated="/contacts">
    ...
  </tbody>
</table>

<dialog x-data @dialog:open.window="$el.open = true">
  <div id="contact"></div>
</dialog>
```

Notice that the `<tbody>` has an `id` and is listening to two events:
  1. When the `ajax:before` event is triggered we dispatch a `dialog:open` event.
  2. When the `contact:updated` event is triggered we issue a `GET` request to `/contacts` and refresh the `<tbody>` to match the server.

Here is the HTML for a table row:

```html
<tr>
  <td>Finn Mertins</td>
  <td>fmertins@candykingdom.gov</td>
  <td>Active</td>
  <td><a href="/contacts/1/edit" x-target="contact">Edit</a></td>
</tr>
```

In each table row we have an "Edit" link targeting the empty `#contact` `<div>` inside our `<dialog>`.

Clicking the "Edit" link issues a `GET` request to `/contacts/1/edit` which returns the corresponding `<form>` for the contact inside the `<dialog>`:

```html
<form id="contact" x-data x-ajax @ajax:success="$dispatch('contact:updated')" method="put" action="/contacts/1" aria-label="Contact Information">
  <div>
    <label for="name">Name</label>
    <input id="name" name="name" value="Finn">
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="fmertins@candykingdom.gov">
  </div>
  <div>
    <label for="status">Status</label>
    <select id="status" name="status">
      <option value="Active" selected>Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>
  <button>Update</button>
</form>
```

Notice the `<form>` has the `x-ajax` attribute so that both success and error responses are rendered within the `<dialog>`.

When the `<form>` is submitted a `PUT` request is issued to `/contacts/1` and the `contact:updated` event is fired upon a successful response.

Finally, the `contact:updated` event causes the `<tbody>` to refresh with the upated contact data.

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
      update: (id, changes) => {
        let index = data.findIndex(contact => contact.id === parseInt(id))
        if (index !== -1) {
          data[index] = Object.assign(data[index], changes)
        }
      },
      all: () => data,
    }
  }()

  document.addEventListener('DOMContentLoaded', () => {
    let routes = {
      'GET /contacts': () => index(database.all()),
    }
    database.all().forEach(contact => {
      routes[`GET /contacts/${contact.id}`] = () => show(database.find(contact.id))
      routes[`GET /contacts/${contact.id}/edit`] = () => edit(database.find(contact.id))
      routes[`PUT /contacts/${contact.id}`] = (formData) => {
        database.update(contact.id, {
          name: formData.get('name'),
          email: formData.get('email'),
          status: formData.get('status'),
        })
        return show(database.find(contact.id))
      }
    })
    window.server(routes).get('/contacts')
  })

  function index(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>${contact.status}</td>
  <td><a href="/contacts/${contact.id}/edit" x-target="contact">Edit</a></td>
</tr>`).join('\n')
    return table(rows)
  }

  function show(contact) {
    return `<div id="contact">
  <p><strong>Name</strong>: ${contact.name}</p>
  <p><strong>Email</strong>: ${contact.email}</p>
  <p><strong>Status</strong>: ${contact.status}</p>
</div>`
  }

  function edit(contact) {
    return `<form id="contact" x-data x-ajax @ajax:success="$dispatch('contact:updated')" method="put" action="/contacts/${contact.id}" aria-label="Contact Information">
    <div>
      <label for="name">Name</label>
      <input id="name" name="name" value="${contact.name}">
    </div>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" value="${contact.email}">
    </div>
    <div>
      <label for="status">Status</label>
      <select id="status" name="status">
        <option value="Active" ${contact.status == 'Active' ? 'selected' : ''}>Active</option>
        <option value="Inactive" ${contact.status == 'Inactive' ? 'selected' : ''}>Inactive</option>
      </select>
    </div>
    <button>Update</button>
  </form>`
  }

  function table(rows) {
    return `<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th width="53">Action</th>
    </tr>
  </thead>
  <tbody x-data x-ajax id="contacts" @ajax:before="$dispatch('dialog:open')" @ajax:error="alert('test')" x-load:contact:updated="/contacts">
    ${rows}
  </tbody>
</table>
<dialog @dialog:open.window="$el.showModal()" @contact:updated.window="$el.close()">
  <form method="dialog" novalidate><button>&times;</button></form>
  <div id="contact"></div>
</dialog>`
  }
</script>

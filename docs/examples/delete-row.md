---
layout: example.webc
title: Delete Table Row
---

This example shows how to implement a delete button that removes a table row when clicked. First let's look at the
table markup:

```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody x-ajax id="contacts" @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
    ...
  </tbody>
</table>
```

The table is listening for the `ajax:before` event to confirm the delete action.

Each row has a form that will issue a `DELETE` request to delete the row from the server. This request responds
with a table that is lacking the row which was just deleted.

```html
<tr>
  <td>Finn</td>
  <td>fmertins@candykingdom.gov</td>
  <td>Active</td>
  <td>
    <form method="delete" action="/contacts/1">
      <button>Delete</button>
    </form>
  </td>
</tr>
```

<script>
  let database = function () {
    let data = [
      { id: 1, name: "Finn", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@moco.com", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      find: (id) => data.find(contact => contact.id === parseInt(id)),
      remove: (id) => {
        let index = data.findIndex(contact => contact.id === parseInt(id))
        if (index !== -1) {
          data.splice(index, 1)
        }
      },
      all: () => data,
    }
  }()

  document.addEventListener('DOMContentLoaded', () => {
    let routes = {
      'GET /contacts': () => view(database.all()),
    }
    database.all().forEach(contact => {
      routes[`DELETE /contacts/${contact.id}`] = () => {
        database.remove(contact.id)
        return view(database.all())
      }
    })
    window.server(routes).get('/contacts')
  })

  function view(contacts) {
    let rows = contacts.map(contact => `<tr>
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>${contact.status}</td>
  <td>
    <form method="delete" action="/contacts/${contact.id}" style="margin:0;">
      <button>Delete</button>
    </form>
  </td>
</tr>`).join('\n')

    return `<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
      <th scope="col" width="66">Action</th>
    </tr>
  </thead>
  <tbody x-ajax id="contacts" @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
    ${rows}
  </tbody>
</table>`
  }
</script>

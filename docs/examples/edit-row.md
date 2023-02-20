---
layout: example.webc
title: Edit Row
---

This example shows how to implement editable table rows. First let's look at the table:

```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody x-data x-ajax>
    ...
  </tbody>
</table>
```
Here is the HTML for a table row:

```html
<tr id="contact_1">
  <td>Finn Mertins</td>
  <td>fmertins@candykingdom.gov</td>
  <td>
    <a href="/contacts/1/edit" target="contact_1">Edit</a>
  </td>
</tr>
```

Notice the "Edit" link in the table row is targeting its own row, this will tell the request triggered by the "Edit" link to replace the entire table row.

Finally, here is the edit state that will replace a row:

```html
<tr id="contact_1">
  <td><input aria-label="Name" form="contact_1_form" name="name" value="Finn Mertins"></td>
  <td><input aria-label="Email" form="contact_1_form" name="email" type="email" value="fmertins@candykingdom.gov">
  </td>
  <td>
    <a target="contact_1" href="/contacts">Cancel</a>
    <form target="contact_1" id="contact_1_form" method="put" action="/contacts/1">
      <button>Save</button>
    </form>
  </td>
</tr>
```

<script>
  let database = function () {
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
      'GET /contacts': () => view(database.all()),
    }
    database.all().forEach(contact => {
      routes[`GET /contacts/${contact.id}/edit`] = () => edit(database.all())

      routes[`PUT /contacts/${contact.id}`] = (formData) => {
        database.update(contact.id, {
          name: formData.get('name'),
          email: formData.get('email'),
        })
        return view(database.all())
      }
    })
    window.server(routes).get('/contacts')
  })

  function view(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td><a href="/contacts/${contact.id}/edit" target="contact_${contact.id}">Edit</a></td>
</tr>`).join('\n')
    return table(rows)
  }

  function edit(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td><input aria-label="Name" form="contact_${contact.id}_form" name="name" value="${contact.name}"></td>
  <td><input aria-label="Email" form="contact_${contact.id}_form" name="email" value="${contact.email}"></td>
  <td>
      <a target="contact_${contact.id}" href="/contacts">Cancel</a>
      <form target="contact_${contact.id}" id="contact_${contact.id}_form" method="put" action="/contacts/${contact.id}" style="margin:0;display:inline-flex;">
        <button>Save</button>
      </form>
  </td>
</tr>`).join('\n')
    return table(rows)
  }

  function table(rows) {
    return `<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col" width="130">Action</th>
    </tr>
  </thead>
  <tbody x-data x-ajax>
    ${rows}
  </tbody>
</table>`
  }
</script>

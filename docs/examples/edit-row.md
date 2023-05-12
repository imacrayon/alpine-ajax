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
  <tbody>
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
    <a id="contact_1_edit" href="/contacts/1/edit" x-target="contact_1" x-focus="contact_1_name">Edit</a>
  </td>
</tr>
```

Notice the "Edit" link in the table row is targeting its own row, this will tell the request triggered by the "Edit" link to replace the entire table row. Additionally, we've added an `id` and `x-focus` attribute to the "Edit" link so that we can control keyboard focus and we switch between "view" and "edit" modes for this table row.

Finally, here is the "edit mode" state that will replace a row:

```html
<tr id="contact_1">
  <td><input aria-label="Name" form="contact_1_form" name="name" id="contact_1_name" value="Finn Mertins"></td>
  <td><input aria-label="Email" form="contact_1_form" name="email" type="email" id="contact_1_email" value="fmertins@candykingdom.gov">
  </td>
  <td>
    <a x-target="contact_1" href="/contacts" x-focus="contact_1_edit">Cancel</a>
    <form x-target="contact_1" id="contact_1_form" method="put" action="/contacts/1" x-focus="contact_1_edit">
      <button>Save</button>
    </form>
  </td>
</tr>
```
Note the matching `id="contact_1"` which is used to match the table row being replaced. We've also added `x-focus` to the "Cancel" link and edit form so that keyboard focus is returned to the "Edit" button in "view mode" when we cancel or submit changes.

Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between "view mode" and "edit mode" in each row.

<script>
  let database = function () {
    let data = [
      { id: 1, name: "Finn Mertins", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake the Dog", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@mo.co", status: "Active" },
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

  window.route('GET', '/contacts', () => view(database.all()))
  database.all().forEach(contact => {
    window.route('GET', `/contacts/${contact.id}/edit`, () => edit(database.all()))
    window.route('PUT', `/contacts/${contact.id}`, (input) => {
      database.update(contact.id, input)

      return view(database.all())
    })
  })

  example('/contacts')

  function view(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td><a href="/contacts/${contact.id}/edit" x-target="contact_${contact.id}" id="contact_${contact.id}_edit" x-focus="contact_${contact.id}_name">Edit</a></td>
</tr>`).join('\n')
    return table(rows)
  }

  function edit(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td><input aria-label="Name" form="contact_${contact.id}_form" name="name" id="contact_${contact.id}_name" value="${contact.name}"></td>
  <td><input aria-label="Email" form="contact_${contact.id}_form" name="email" id="contact_${contact.id}_email" value="${contact.email}"></td>
  <td>
      <a x-target="contact_${contact.id}" href="/contacts" x-focus="contact_${contact.id}_edit">Cancel</a>
      <form x-target="contact_${contact.id}" id="contact_${contact.id}_form" method="put" action="/contacts/${contact.id}" x-focus="contact_${contact.id}_edit" style="margin:0;display:inline-flex;">
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
  <tbody>
    ${rows}
  </tbody>
</table>`
  }
</script>

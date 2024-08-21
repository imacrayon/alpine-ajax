---
title: Edit Row
eleventyNavigation:
  key: Edit Row
  excerpt: Edit a table row inline.
  order: 5
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
    <a href="/contacts/1/edit" x-target="contact_1">Edit</a>
  </td>
</tr>
```

Notice the "Edit" link in the table row is targeting its own row, this will tell the request triggered by the "Edit" link to replace the entire table row.

Finally, here is the "edit mode" state that will replace a row:

```html
<tr id="contact_1">
  <td><input aria-label="Name" form="contact_1_form" name="name" value="Finn Mertins"></td>
  <td><input aria-label="Email" form="contact_1_form" name="email" value="fmertins@candykingdom.gov" type="email">
  </td>
  <td>
    <a x-target="contact_1" href="/contacts">Cancel</a>
    <form x-target="contact_1" id="contact_1_form" method="put" action="/contacts/1">
      <button>Save</button>
    </form>
  </td>
</tr>
```

When submitted, the form issues a `PUT` back to `/contacts/1`, which will again display the "view mode" with updated contact details.

## Improving focus

Our editable table is functioning now, but we can sprinkle in a few more attributes to ensure that it's a good experience for keyboard users. We'll use the `x-autofocus` attribute to control the keyboard focus as we switch between the "view" and "edit" modes on the page.

First, we'll add `x-autofocus` to the "Name" field so that it is focused when our edit form is rendered:

```html
<input aria-label="Name" form="contact_1_form" name="name" value="Finn Mertins" x-autofocus>
```

Next, we'll add `x-autofocus` to the "Edit" link, so that it is focused when returning back to the details page:

```html
<a href="/contacts/1/edit" x-target="contact_1" x-autofocus>Edit</a>
```

Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between the "view" and "edit" modes.

<style>
  td > div {
    display: flex;
    align-items: center;
    gap: .5rem;
  }
</style>

<script type="module">
  let database = function () {
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

  window.route('GET', '/contacts', () => view(database.all()))
  database.all().forEach(contact => {
    window.route('GET', `/contacts/${contact.id}/edit`, () => edit(database.all()))
    window.route('PUT', `/contacts/${contact.id}`, (input) => {
      database.update(contact.id, input)

      return view(database.all())
    })
  })

  window.example('/contacts')

  function view(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td><a href="/contacts/${contact.id}/edit" x-target="contact_${contact.id}" x-autofocus>Edit</a></td>
</tr>`).join('\n')
    return table(rows)
  }

  function edit(contacts) {
    let rows = contacts.map(contact => `<tr id="contact_${contact.id}">
  <td><input aria-label="Name" form="contact_${contact.id}_form" name="name" value="${contact.name}" x-autofocus></td>
  <td><input aria-label="Email" form="contact_${contact.id}_form" name="email" value="${contact.email}"></td>
  <td>
    <div>
      <a x-target="contact_${contact.id}" href="/contacts">Cancel</a>
      <form x-target="contact_${contact.id}" id="contact_${contact.id}_form" method="put" action="/contacts/${contact.id}">
        <button>Save</button>
      </form>
    </div>
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

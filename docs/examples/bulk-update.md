---
title: Bulk Update
eleventyNavigation:
  key: Bulk Update
  excerpt: Change multiple items in a collection at once.
  order: 6
---

This demo shows how to implement a common pattern where rows are selected and then bulk updated. This is
accomplished by putting an AJAX form below a table, with associated checkboxes in the table. When the AJAX form is submitted, each checked value will be included in a `PUT` request to `/contacts`.

```html
<table id="contacts">
  <thead>
    <tr>
      <th scope="col">Edit</th>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input type="checkbox" form="contacts_form" aria-label="Change Status" name="ids" value="0"></td>
      <td>Finn Mertins</td>
      <td>Active</td>
    </tr>
    ...
  </tbody>
</table>
<form x-target="contacts" id="contacts_form" method="put" action="/contacts">
  <button name="status" value="Active">Activate</button>
  <button name="status" value="Inactive">Deactivate</button>
</form>
```

Notice the AJAX form is targeting the `contacts` table. The server will either activate or deactivate the checked users and then rerender the `contacts` table with
updated rows.

{% js %}
  let database = function () {
    let data = [
      { id: 1, name: "Finn", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@mo.co", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      find: (id) => data.find(contact => contact.id === parseInt(id)),
      all: () => data,
    }
  }()

  window.route('GET', '/contacts', () => view(database.all()))
  window.route('PUT', '/contacts', (input) => {
    let ids = Array.isArray(input.ids) ? input.ids : [input.ids]
    ids.filter(id => id).forEach(id => {
      database.find(id)['status'] = input.status
    })

    return view(database.all());
  })

  window.example('/contacts')

  function view(contacts) {
    let rows = contacts.map(contact => `<tr>
  <td><input type="checkbox" form="contacts_form" aria-label="Change Status" name="ids" value="${contact.id}"></td>
  <td>${contact.name}</td>
  <td>${contact.status}</td>
</tr>`).join('\n')

    return `<table id="contacts">
  <thead>
    <tr>
      <th scope="col">Edit</th>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
<form x-target="contacts" id="contacts_form" method="put" action="/contacts">
  <button name="status" value="Active">Activate</button>
  <button name="status" value="Inactive">Deactivate</button>
</form>`
  }
{% endjs %}

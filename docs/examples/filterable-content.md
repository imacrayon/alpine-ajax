---
layout: example.webc
title: Filterable Content
---

This example filters down a table of contacts based on the user's selection.

We start with some filter buttons and a table inside an AJAX component with `id="contacts"`.

```html
<div x-ajax id="contacts">
  <form action="/contacts" role="search" aria-label="Filter contacts">
    <button name="status" value="Active" aria-pressed="false">Active</button>
    <button name="status" value="Inactive" aria-pressed="false">Inactive</button>
  </form>
  <table>
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Email</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Finn</td>
        <td>fmertins@candykingdom.gov</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Jake</td>
        <td>jake@candykingdom.gov</td>
        <td>Inactive</td>
      </tr>
      ...
    </tbody>
  </table>
</div>
```

Clicking a filter button issues a `GET` request to `/contacts?status=` which returns a response with updated content.

First, the table in the response will include only content related to the active filter:

```html
<tbody>
  <tr>
    <td>Finn</td>
    <td>fmertins@candykingdom.gov</td>
    <td>Active</td>
  </tr>
</tbody>
```

Second, the response will include the modified state of the filter form. Notice that the "Active" button has `aria-pressed="true"` to indicate that it has been selected and that the form includes a new button to reset the filter settings:

```html
<form action="/contacts" role="search" aria-label="Filter contacts">
  <button name="status" value="Active" aria-pressed="true">Active</button>
  <button name="status" value="Inactive" aria-pressed="false">Inactive</button>
  <button name="status" value="" aria-pressed="false">Reset</button>
</form>
```

The `<form>` and `<table>` should be wrapped an AJAX component with `id="contacts"` to indicate that both elements should be updated when a request is issued.

```html
<div x-ajax id="contacts">
  <form>...</form>
  <table>...</table>
</div>
```

<script>
  let database = function () {
    let data = [
      { id: 1, name: "Finn", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake", email: "jake@candykingdom.gov", status: "Inactive" },
      { id: 3, name: "BMO", email: "bmo@moco.com", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      filter: (key, value) => {
        return data.filter(contact => contact[key] === value)
      },
      all: () => data,
    }
  }()

  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /contacts': (formData, params) => {
        return view(params.get('status'))
      },
    }).get('/contacts')
  })

  function view(filter = null) {
    let contacts = filter ? database.filter('status', filter) : database.all()
    let rows = contacts.map(contact => `<tr>
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>${contact.status}</td>
</tr>`).join('\n')

    let reset = filter ? `<button name="status" value="">Reset</button>` : ``

    return `<div x-ajax id="contacts">
<form action="/contacts" role="search" aria-label="Filter contacts">
  <button name="status" value="Active" aria-pressed="${String(filter === 'Active')}">Active</button>
  <button name="status" value="Inactive" aria-pressed="${String(filter === 'Inactive')}">Inactive</button>
  ${reset}
</form>
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    ${rows ? rows : '<tr><td colspan="3" style="text-align:center;"><em>No results</em></td></tr>'}
  </tbody>
</table>
</div>`
  }
</script>

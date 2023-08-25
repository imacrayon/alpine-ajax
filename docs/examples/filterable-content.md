---
title: Filterable Content
eleventyNavigation:
  key: Filterable Content
  excerpt: Filter down a table or list of content.
  order: 8
---

This example filters down a table of contacts based on the user's selection.

We start with some filter buttons and a table inside an AJAX Component with `id="contacts"`. It's important to note the `x-arrange="morph"` attribute on the AJAX Component. The `morph` option ensures that the keyboard focus state of our filter buttons will be preserved as the HTML on our Component changes between AJAX requests.

```html
<div id="contacts" x-arrange="morph">
  <form action="/contacts" aria-label="Filter contacts" x-init x-target="contacts">
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

First, the response should include the modified state of the filter form:

```html
<form action="/contacts" aria-label="Filter contacts" x-init x-target="contacts">
  <button name="status" value="Active" aria-pressed="true">Active</button>
  <button name="status" value="Inactive" aria-pressed="false">Inactive</button>
  <button name="status" value="" aria-pressed="false">Reset</button>
</form>
```

The "Active" button has `aria-pressed="true"` to indicate that it has been selected and the form includes a new button to reset the filter settings.

Second, the response should also include the markup for our table with only content related to the active filter:

```html
<tbody>
  <tr>
    <td>Finn</td>
    <td>fmertins@candykingdom.gov</td>
    <td>Active</td>
  </tr>
</tbody>
```

Let's see our filterable table in action. Try activating a filter button using the keyboard, notice that the keyboard focus stays consistent even as the content on the page changes:

<style>
  form {
    margin-bottom: 1rem;
  }
</style>

<script type="module">
  let database = function () {
    let data = [
      { id: 1, name: "Finn", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake", email: "jake@candykingdom.gov", status: "Inactive" },
      { id: 3, name: "BMO", email: "bmo@mo.co", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      filter: (key, value) => {
        return data.filter(contact => contact[key] === value)
      },
      all: () => data,
    }
  }()

  window.route('GET', '/contacts', (input) => view(input.status))
  window.example('/contacts')

  function view(filter = null) {
    let contacts = filter ? database.filter('status', filter) : database.all()
    let rows = contacts.map(contact => `<tr>
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>${contact.status}</td>
</tr>`).join('\n')

    let reset = filter ? `<button name="status" value="">Reset</button>` : ``

    return `<div x-arrange="morph" id="contacts">
<form action="/contacts" aria-label="Filter contacts" x-init x-target="contacts">
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

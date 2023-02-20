---
layout: example.webc
title: Instant Search
---

This example actively searches a contacts database as the user enters text.

We start with a search form and a table:

```html
<form x-data x-ajax target="contacts" action="/contacts" role="search" aria-label="Contacts">
  <input type="search" name="search" aria-label="Search Term" placeholder="Type to filter contacts..." @input.debounce="$el.form.requestSubmit()" @search="$el.form.requestSubmit()">
  <button x-show="false">Search</button>
</form>
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody id="contacts">
    <tr>
      <td>Finn</td>
      <td>fmertins@candykingdom.gov</td>
      <td>Active</td>
    </tr>
    ...
  </tbody>
</table>
```

The input issues a `GET` request to `/contacts?search=` on the `input` event and sets the body of the table to be
the resulting content.

We add the `debounce` modifier to the trigger a delay sending the query until the user stops typing.

Since we use a `search` type input we will get an `x` in the input field to clear the input.
To make this trigger a new `POST` we have to specify another trigger. We specify another trigger by using a comma to
separate them. The `search` trigger will be run when the field is cleared but it also makes it possible to override
the debounce delay by just pressing enter.

We use `x-show="false"` on the form's submit button so that it gets hidden when JavaScript is loaded. This ensures
that search
form is still functional if JavaScript fails to load or is disabled.

<script>
  let database = function () {
    let data = [
      { id: 1, name: "Finn", email: "fmertins@candykingdom.gov", status: "Active" },
      { id: 2, name: "Jake", email: "jake@candykingdom.gov", status: "Active" },
      { id: 3, name: "BMO", email: "bmo@moco.com", status: "Active" },
      { id: 4, name: "Marceline", email: "marceline@vampirequeen.me", status: "Inactive" }
    ];
    return {
      search: (term) => {
        term = term.toLowerCase()
        return data.filter(contact => {
          return contact.name.toLowerCase().includes(term) ||
            contact.email.toLowerCase().includes(term) ||
            contact.status.toLowerCase().includes(term)
        })
      },
      all: () => data,
    }
  }()

  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /contacts': (formData, params) => {
        let search = params.get('search')
        let contacts = search ? database.search(search) : database.all()
        return view(contacts)
      },
    }).get('/contacts')
  })

  function view(contacts) {
    let rows = contacts.map(contact => `<tr>
  <td>${contact.name}</td>
  <td>${contact.email}</td>
  <td>${contact.status}</td>
</tr>`).join('\n')

    return `<form x-data x-ajax target="contacts" action="/contacts" role="search" aria-label="Contacts">
  <input type="search" name="search" placeholder="Type to filter contacts..."
      @input.debounce="$el.form.requestSubmit()" @search="$el.form.requestSubmit()">
      <button x-show="false">Search</button>
</form>
<table id="contacts">
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
</table>`
  }
</script>

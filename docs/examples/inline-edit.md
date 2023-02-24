---
layout: example.webc
title: Inline Edit
---

The inline edit pattern provides a way to edit parts of a record without a page refresh.

This pattern starts with a UI that shows the details of a contact. The `<div>` has a link that will fetch the editing UI for the contact from `/contacts/1/edit`

```html
<div x-ajax id="contact_1">
  <p><strong>First Name</strong>: Finn</p>
  <p><strong>Last Name</strong>: Mertens</p>
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit">Edit</a>
</div>
```

This returns a form that can be used to edit the contact:

```html
<form x-ajax id="contact_1" method="put" action="/contacts/1" aria-label="Contact Information">
  <div>
    <label for="first_name">First Name</label>
    <input id="first_name" name="first_name" value="Finn">
  </div>
  <div>
    <label for="last_name">Last Name</label>
    <input id="last_name" name="last_name" value="Mertens">
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="fmertens@candykingdom.gov">
  </div>
  <button>Update</button>
  <a href="/contacts/1">Cancel</a>
</form>
```

The form issues a `PUT` back to `/contacts/1`, following the usual REST-ful pattern.

<script>
  let contact = {
    "first_name": "Finn",
    "last_name": "Mertens",
    "email": "fmertens@candykingdom.gov"
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /contacts/1': () => show(contact),
      'GET /contacts/1/edit': () => edit(contact),
      'PUT /contacts/1': (formData) => {
        contact.first_name = formData.get('first_name');
        contact.last_name = formData.get('last_name');
        contact.email = formData.get('email');
        return show(contact);
      }
    }).get('/contacts/1')
  })

  function edit(contact) {
    return `<form x-ajax id="contact_1" method="put" action="/contacts/1" aria-label="Contact Information">
  <div>
    <label for="first_name">First Name</label>
    <input id="first_name" name="first_name" value="${contact.first_name}">
  </div>
  <div>
    <label for="last_name">Last Name</label>
    <input id="last_name" name="last_name" value="${contact.last_name}">
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="${contact.email}">
  </div>
  <button class="primary">Update</button>
  <a href="/contacts/1">Cancel</a>
</form>`
  }

  function show(contact) {
    return `<div x-ajax id="contact_1">
  <p><strong>First Name</strong>: ${contact.first_name}</p>
  <p><strong>Last Name</strong>: ${contact.last_name}</p>
  <p><strong>Email</strong>: ${contact.email}</p>
  <a href="/contacts/1/edit">Edit</a>
</div>`;
  }
</script>

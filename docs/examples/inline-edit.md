---
layout: example.webc
title: Inline Edit
---

The inline edit pattern provides a way to edit parts of a record by toggling between a "view mode" and "edit mode" without a page refresh .

This pattern starts with a "view mode" showing the details of a contact inside an AJAX Component assigned `id="contact_1"`. The AJAX Component contains a link that will fetch the "edit mode" for editing a contact at the URL `/contacts/1/edit`.

```html
<div id="contact_1">
  <p><strong>First Name</strong>: Finn</p>
  <p><strong>Last Name</strong>: Mertens</p>
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit" x-target="contact_1">Edit</a>
</div>
```

This returns a form that can be used to edit the contact:

```html
<form id="contact_1" x-target method="put" action="/contacts/1" aria-label="Contact Information">
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
  <a href="/contacts/1" x-target="contact_1">Cancel</a>
</form>
```

When submitted, the form issues a `PUT` back to `/contacts/1`, which will again display the "view mode" with updated contact details.

## Improving focus

Our inline edit pattern is functioning now, but we can sprinkle in a few more attributes to ensure that it's a good experience for keyboard users. We'll use the `x-focus` attribute to control the keyboard focus as we switch between the view and edit modes on the page.

First, we'll instruct the "Edit" link to focus on the "First Name" field when it is clicked:

```html
<a href="/contacts/1/edit" x-target="contact_1" x-focus="first_name">Edit</a>
```

Next, we'll add an `id` to the "Edit" link, so we can reference it from "edit mode":

```html
<a href="/contacts/1/edit" id="contact_1_edit" x-target="contact_1" x-focus="first_name">Edit</a>
```

Lastly, we'll update the edit form and the "Cancel" link so that focus is returned to the "Edit" link when the form is submitted or the "Cancel" link is clicked:

```html
<form id="contact_1" x-target method="put" action="/contacts/1" x-focus="contact_1_edit" aria-label="Contact Information">
  ...
  <a href="/contacts/1" x-target="contact_1" x-focus="contact_1_edit">Cancel</a>
</form>
```

Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between modes.


<script>
  let contact = {
    "first_name": "Finn",
    "last_name": "Mertens",
    "email": "fmertens@candykingdom.gov"
  };

  window.route('GET', '/contacts/1', () => show(contact))
  window.route('GET', '/contacts/1/edit', () => edit(contact))
  window.route('PUT', '/contacts/1', (input) => {
    contact.first_name = input.first_name
    contact.last_name = input.last_name
    contact.email = input.email
    return show(contact)
  })

  example('/contacts/1')

  function edit(contact) {
    return `<form id="contact_1" x-target method="put" action="/contacts/1" x-focus="contact_1_edit" aria-label="Contact Information">
  <div>
    <label for="first_name">First Name</label>
    <input id="first_name" name="first_name" value="${contact.first_name}" style="width:18ch">
  </div>
  <div>
    <label for="last_name">Last Name</label>
    <input id="last_name" name="last_name" value="${contact.last_name}" style="width:18ch">
  </div>
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" value="${contact.email}" style="width:22ch">
  </div>
  <button class="primary">Update</button>
  <a href="/contacts/1" x-target="contact_1" x-focus="contact_1_edit">Cancel</a>
</form>`
  }

  function show(contact) {
    return `<div id="contact_1">
  <p><strong>First Name</strong>: ${contact.first_name}</p>
  <p><strong>Last Name</strong>: ${contact.last_name}</p>
  <p><strong>Email</strong>: ${contact.email}</p>
  <a href="/contacts/1/edit" id="contact_1_edit" x-target="contact_1" x-focus="first_name">Edit</a>
</div>`;
  }
</script>

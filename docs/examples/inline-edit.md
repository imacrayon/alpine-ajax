---
title: Inline Edit
eleventyNavigation:
  key: Inline Edit
  excerpt: Edit details inline.
  order: 3
---

The inline edit pattern provides a way to edit parts of a record by toggling between a "view mode" and "edit mode" without a page refresh .

This pattern starts with a "view mode" showing the details of a contact inside an element with `id="contact_1"`. The "Edit" link will fetch the "edit mode" for editing a contact at the URL `/contacts/1/edit`.

```html
<div id="contact_1">
  <p><strong>First Name</strong>: Finn</p>
  <p><strong>Last Name</strong>: Mertens</p>
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>
  <a href="/contacts/1/edit" x-init x-target="contact_1">Edit</a>
</div>
```

This returns a form that can be used to edit the contact:

```html
<form id="contact_1" x-init x-target method="put" action="/contacts/1" aria-label="Contact Information">
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

Our inline edit pattern is functioning now, but we can sprinkle in a few more attributes to ensure that it's a good experience for keyboard users. We'll use the `x-autofocus` attribute to control the keyboard focus as we switch between the view and edit modes on the page.

First, we'll add `x-autofocus` to the "First Name" field so that it is focused when our edit form is rendered:

```html
<input id="first_name" name="first_name" x-autofocus>
```

Next, we'll add `x-autofocus` to the "Edit" link, so that it is focused when returning back to the details page:

```html
<a href="/contacts/1/edit" x-target="contact_1" x-autofocus>Edit</a>
```

Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between the "view" and "edit" modes.

<style>
@keyframes fade-in {
  from { opacity: 0; }
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes slide-from-right {
  from { transform: translateX(25%); }
}

@keyframes slide-to-left {
  to { transform: translateX(25%); }
}

/* define animations for the old and new content */
::view-transition-old(slide-fade) {
  animation: 200ms ease 150ms both fade-out, 200ms ease 150ms both slide-to-left;
}
::view-transition-new(slide-fade) {
  animation: 300ms ease 50ms both fade-in, 300ms ease 50ms both slide-from-right;
}

form {
  background: #fff;
  view-transition-name: slide-fade;
}
</style>


<script type="module">
  let contact = {
    "first_name": "Finn",
    "last_name": "Mertens",
    "email": "fmertens@candykingdom.gov"
  }

  window.route('GET', '/contacts/1', () => show(contact))
  window.route('GET', '/contacts/1/edit', () => edit(contact))
  window.route('PUT', '/contacts/1', (input) => {
    contact.first_name = input.first_name
    contact.last_name = input.last_name
    contact.email = input.email

    return show(contact)
  })

  window.example('/contacts/1')

  function edit(contact) {
    return `<form id="contact_1" x-init x-target x-merge.transition method="put" action="/contacts/1" aria-label="Contact Information">
  <div>
    <label for="first_name">First Name</label>
    <input id="first_name" name="first_name" x-autofocus value="${contact.first_name}" style="width:18ch">
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
  <a href="/contacts/1" x-target="contact_1">Cancel</a>
</form>`
  }

  function show(contact) {
    return `<div id="contact_1" x-merge.transition>
  <p><strong>First Name</strong>: ${contact.first_name}</p>
  <p><strong>Last Name</strong>: ${contact.last_name}</p>
  <p><strong>Email</strong>: ${contact.email}</p>
  <a href="/contacts/1/edit" x-init x-target="contact_1" x-autofocus>Edit</a>
</div>`
  }
</script>

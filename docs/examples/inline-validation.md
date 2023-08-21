---
title: Inline Validation
eleventyNavigation:
  key: Inline Validation
  excerpt: Validate an input field before it is submitted.
  order: 9
---

This example shows how to do inline field validation. In this example we'll create an email field that can issue requests to our server with an email to be validated, the server will then render validation messages that will be inserted into the DOM.

We start with this form:

```html
<form x-data="{ email: '' }" aria-label="Register">
  <div id="email_field" @change="$ajax('/validate-email', {
    method: 'post',
    body: { email },
  })">
    <label for="email">Email</label>
    <input type="email" name="email" id="email" x-model="email">
  </div>
  <div>
    <label for="name">Name</label>
    <input name="name" id="name">
  </div>
  <button>Submit</button>
</form>
```

Note that the first `div` in the form has an `id` of `email_field` and it is listening for the `change` event. When the change event occurs the field will issue a `POST` request to the `/validate-email` endpoint.

The server will return the same form markup containing a new validation error message:

```html
<form x-data="{ email: '' }" aria-label="Register">
  <div id="email_field" @change="$ajax('/validate-email', {
    method: 'post',
    body: { email },
  })">
    <label for="email">Email</label>
    <div id="email_error" style="color:#cc0000">The email is already taken.</div>
    <input type="email" name="email" id="email" x-model="email" aria-describedby="email_error">
  </div>
  <!-- Omitting the rest of the form for brevity -->
</form>
```

Below is a working demo of this example. Any email input without an "@" is considered invalid and the only email that is accepted is **test@example.com**.

<style>
  label {
    display: block;
  }
</style>

<script type="module">
  window.route('GET', '/register', () => view())
  window.route('POST', '/validate-email', (input) => {
    if (input.email === 'test@example.com') {
      return view()
    } else if (input.email.includes('@')) {
      return view('The email is already taken.')
    }

    return view('The email field is invalid.')
  })

  window.example('/register')

  function view(message = '') {
    message = message ? `<div id="email_error" style="color:#cc0000">${message}</div>` : ''
    return `<form x-data="{ email: '' }" aria-label="Register">
  <div id="email_field" @change="$ajax('/validate-email', {
    method: 'post',
    body: { email },
  })">
    <label for="email">Email</label>
    ${message}
    <input type="email" name="email" id="email" x-model="email"${message ? ' aria-describedby="email_error"' : ''}>
  </div>
  <div>
    <label for="name">Name</label>
    <input name="name" id="name">
  </div>
  <button>Submit</button>
</form>`
  }
</script>

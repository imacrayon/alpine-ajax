---
title: Loading Indicator
eleventyNavigation:
  key: Loading Indicator
  excerpt: Indicate when AJAX requests are processing.
  order: 2
---

This example shows how you can use a little CSS to create a nice looking loading indicator that will appear while AJAX requests are in progress.

We start with a card that contains a link. When the link is clicked, a `GET` request is issued to retrieve a table of contact information.

```html
<div id="card">
  <div id="table">
    <a href="/contacts" x-init x-target="table">Load Contacts</a>
  </div>
</div>
```

The contact table could take a long time to load if it is large, so it would be helpful to indicate to our users that the app is processing their request.

Fortunately, Alpine AJAX adds `aria-busy="true"` to targets while a request is processing. We can use this attribute in our CSS to automatically show and hide a loading indicator:

```css
[aria-busy] {
  --loading-size: 64px;
  --loading-stroke: 6px;
  --loading-duration: 1s;
  position: relative;
  opacity: .75
}
[aria-busy]:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--loading-size);
  height: var(--loading-size);
  margin-top: calc(var(--loading-size) / 2 * -1);
  margin-left: calc(var(--loading-size) / 2 * -1);
  border: var(--loading-stroke) solid rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  border-top-color: rgba(0, 0, 0, 0.5);
  animation: rotate calc(var(--loading-duration)) linear infinite;
}
@keyframes rotate {
  100% { transform: rotate(360deg); }
}
```

<style>
  [aria-busy] {
    --loading-size: 64px;
    --loading-stroke: 6px;
    --loading-duration: 1s;
    position: relative;
    opacity: .75;
  }
  [aria-busy]:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--loading-size);
    height: var(--loading-size);
    margin-top: calc(var(--loading-size) / 2 * -1);
    margin-left: calc(var(--loading-size) / 2 * -1);
    border: var(--loading-stroke) solid rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    border-top-color: rgba(0, 0, 0, 0.5);
    animation: rotate calc(var(--loading-duration)) linear infinite;
  }
  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }

  #table {
    margin-bottom: 0;
    min-height: 164px;
    text-align: center;
  }

</style>


<script type="module">
  window.route('GET', '/dashboard', () => dashboard())
  window.route('GET', '/contacts', () => new Promise(resolve => {
    setTimeout(() => resolve(contacts()), 2000)
  }))

  window.example('/dashboard')

  function dashboard() {
    return `<div id="card">
  <div id="table">
    <a href="/contacts" x-init x-target="table">Load Contacts</a>
  </div>
</div>`
  }

  function contacts(rows) {
    return `<table id="table">
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
    <tr>
      <td>BMO</td>
      <td>bmo@mo.co</td>
      <td>Inactive</td>
    </tr>
    <tr>
      <td>Marceline</td>
      <td>marceline@vampirequeen.me</td>
      <td>Active</td>
    </tr>
  </tbody>
</table>`
  }
</script>

---
eleventyNavigation:
  key: Creating demos
  url: /reference/#creating-demos
  order: 13
---

## Creating demos

Use the mock server script included with Alpine AJAX when you need to build a quick prototype or demonstrate a bug, without a server. The mock server script adds a global `route` helper function for mocking server endpoints on the frontend:

```html
<!--
Include the typical required scripts before the mock server:
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@{{ APLINE_VERSION }}/dist/cdn.min.js"></script>
-->
<script src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@{{ APLINE_AJAX_VERSION }}/dist/server.js"></script>

<script>
route('POST', '/update-quantity', (request) => {
  return `<output id="current_quantity">${Number(request.quantity)}</output>`
})
</script>

<label for="current_quantity">Current quantity</label>
<output id="current_quantity">0</output>
<form x-target="current_quantity" method="POST" action="/update-quantity">
  <label form="quantity">New quantity</label>
  <input type="number" id="quantity" name="quantity">
  <button>Update</button>
</form>
```

Now, instead of issuing a real `POST` request to `/update-quantity`, Alpine AJAX will use the HTML returned in our route definition as the response. Note that any form data included in the AJAX request is made available too you in the `route` function.

<details>
  <summary>Mock server example on CodePen</summary>
  <div>
    <p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="NWLZOrP" data-user="imacrayon" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
      <span>See the Pen <a href="https://codepen.io/imacrayon/pen/NWLZOrP">
      Alpine AJAX Demo</a> by Christian Taylor (<a href="https://codepen.io/imacrayon">@imacrayon</a>)
      on <a href="https://codepen.io">CodePen</a>.</span>
    </p>
    <script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
  </div>
</details>

**Important**: The mock server should only be used for demos and testing, this utility is not designed for production environments.

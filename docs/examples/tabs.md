---
layout: example.webc
title: Tabs
---

<script>
route('POST', '/update-quantity', (request) => {
  return `<output id="current_quantity">${request.quantity}</output>`
})
</script>

<output id="current_quantity">0</output>
<form x-ajax x-target="current_quantity" method="POST" action="/update-quantity">
  <label form="quantity">Quantity</label>
  <input type="number" id="quantity" name="quantity">
  <button>Update</button>
</form>

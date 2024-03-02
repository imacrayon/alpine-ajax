---
title: Infinite Scroll
eleventyNavigation:
  key: Infinite Scroll
  excerpt: Load additional content as the user scrolls.
  order: 13
dependencies:
  - https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js
---

This example demonstrates how to load content automatically when the user scrolls to the end of the page. We'll start by building basic pagination and then we'll enhance it with Alpine AJAX to automatically fetch the next page. Here's our table followed by simple page navigation:
```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody id="records">
    <tr>
      <td>AMO</td>
      <td>amo@mo.co</td>
      <td>Active</td>
    </tr>
    ...
  </tbody>
  <div id="pagination">
    <div>Page 1 of 5</div>
    <div>
      <!-- Page 2 and up would have a "Previous" link like this -->
      <!-- <a href="/contacts?page=1"><span aria-hidden="true">← </span> Previous</a> -->
      <a href="/contacts?page=2">Next<span aria-hidden="true"> →</span></a>
    </div>
  </div>
</table>
```

Alpine already provides a great way to react to a users's scroll position: We can use the first-party [Intercept Plugin](https://alpinejs.dev/plugins/intersect), so let's load that onto the page:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"></script>
```

_If you'd rather bundle your JavaScript, the [Intercept Plugin installation instructions](https://alpinejs.dev/plugins/intersect#installation) explain how to do this too._

With the Intercept Plugin installed we can update our pagination markup to issue an AJAX request when it is scrolled into view:

```html
<div id="pagination" x-init x-intersect="$ajax('/contacts?page=2')" x-target="records pagination">
</div>
```

Note that the `x-target` attribute includes both the table **and** pagination. This ensures that the table is updated with fresh records and the pagination is updated with a fresh page URL after each AJAX request.

Lastly, we need to ensure that the new table rows from subsequent pages are _appended_ to the end of the table. The default behavior is for Alpine AJAX to _replace_ the existing table rows with the incoming rows. To change this behavior we need to add `x-merge="append"` to the element that will receive the new records, in this case that's our table's `tbody`:

```html
<tbody id="records" x-merge="append">
```

<style>
#pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#pagination[aria-busy] div:first-child:after {
  content: '';
  margin-left: .5em;
  display: inline-block;
  width: .875em;
  height: .875em;
  vertical-align: -.25em;
  border: .1875em solid rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  border-top-color: rgba(0, 0, 0, 0.5);
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  100% { transform: rotate(360deg); }
}
</style>

<script type="module">
  window.route('GET', '/contacts', (input) => {
    if (input.page) {
      return new Promise(resolve => {
        setTimeout(() => resolve(view(parseInt(input.page))), 1000)
      })
    }

    return view(1)
  })

  window.example('/contacts')

  function view(page) {
    let max = 5
    let end = page * 10
    let cursor = end - 9
    let rows = []
    let prefix = ''
    let status = ''
    while (cursor <= end) {
      prefix = getPrefix(cursor)
      status = Math.random() < 0.5 ? 'Active' : 'Inactive'
      rows.push(`<tr>
        <td>${prefix}MO</td>
        <td>${prefix.toLowerCase()}mo@mo.co</td>
        <td>${status}</td>
      </tr>`)
      cursor++;
    }
    rows = rows.join('\n')
    let prev = ''
    let next = ''
    if (page > 1) {
      prev = `<a href="/contacts?page=${page - 1}" x-show="false"><span aria-hidden="true">← </span> Prev</a>`
    }
    if (page < 5) {
      next = `<a href="/contacts?page=${page + 1}" x-show="false">Next<span aria-hidden="true"> →</span></a>`
    }

    let intersect = next ? `x-intersect="$ajax('/contacts?page=${page + 1}')" x-target="records pagination"` : ''

    return `<table id="contacts">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody id="records" x-merge="append">
    ${rows}
  </tbody>
</table>
<div id="pagination">
  <div>Page ${page} of ${max}</div>
  <div x-init ${intersect}>
    ${prev}
    ${next}
  </div>
</div>`
  }

let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function getPrefix(number, result = ''){
  let index = number % alphabet.length
  let quotient = number / alphabet.length
  if (index - 1 == -1) {
      index = alphabet.length
      quotient = quotient - 1
  }
  result = alphabet.charAt(index - 1) + result

  return quotient >= 1
    ? getPrefix(parseInt(quotient), result)
    : result
}
</script>

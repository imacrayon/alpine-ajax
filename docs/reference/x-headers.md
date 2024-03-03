---
eleventyNavigation:
  key: x-headers
  url: /reference/#x-headers
  order: 4
---

## x-headers

Use `x-headers` to add additional request headers:

```html
<form method="post" action="/comments" x-target="comments comments_count" x-headers="{'Custom-Header': 'Shmow-zow!'}">
```

Alpine AJAX adds two default headers to every request: `X-Alpine-Request` which is always `true`, and `X-Alpine-Target` which contains a space-separated list of target IDs. The previous form example would include these headers with its request:

```txt
X-Alpine-Request: true
X-Alpine-Target: comments comments_count
Custom-Header: Shmow-zow!
```

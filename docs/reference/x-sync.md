---
eleventyNavigation:
  key: x-sync
  url: /reference/#x-sync
  order: 7
---

## x-sync

Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `x-target`.

`x-sync` elements must have a unique `id`. Any element sent from the server with a matching `id` will replace the existing `x-sync` element.

Use cases for this attribute are unread message counters or notification flashes. These elements often live in the base layout, outside of the content area that is being replaced.

Consider this list of notifications:

```html
<div role="status">
  <ul x-sync id="notifications"></ul>
</div>
```

Every server response that includes an element with `id="notifications"` will replace the existing list of notifications inside the `aria-live` region. Take a look at the [Notifications example](/examples/notifications) for a complete demonstration of this UI pattern.

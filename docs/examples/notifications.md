---
layout: example.webc
title: Notifications
---

This demo shows how to implement notification "toasts".

This pattern starts with an empty list for our notifications, the list needs an `id` and `x-sync`. We've added `aria-live` to the list so that screen readers will read out new notifications when the are added to the list.

```html
<ul x-sync id="notification_list" role="status" aria-live="polite">
</ul>
```

We'll also add a `<form>` to this demo so that we can issue requests to the server that will trigger new notifications.

```html
<form x-ajax id="action" method="post" action="/action">
  <button>Click Me</button>
</form>
```

When the`<form>` is submitted the server will respond with a new notification in the list:

```html
<form x-ajax id="action" method="post" action="/action">
  <button>Click Me</button>
</form>
<ul x-sync id="notification_list" role="status" aria-live="polite">
  <li>
    <span>The button was pressed 1 time.</span>
  </li>
</ul>
```

Notice that our form doesn't target the `notification_list` element, however because our list has the `x-sync` attribute it automatically updates any time the server's response includes an element with the `id` of `notification_list`.

We can sprinkle in some additional Alpine code to animate the our notifications:

```html
<li key="1" x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was pressed 1 time.</span>
</li>
```

Additionally, we can add a "Dismiss" button to each notification:

```html
<li key="1" x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
    },
    dismiss() {
      this.show = false
      setTimeout(() => this.$el.remove(), 500)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was pressed 1 time.</span>
  <button @click="dismiss()" type="button" aria-label="Dismiss">&times;</button>
</li>
```

And finally, we can make our notifications automatically dismiss themselves after 6 seconds, by adding a `setTimeout` in the `init` method:

```html
<li key="1" x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
      setTimeout(() => this.dismiss(), 6000)
    },
    dismiss() {
      this.show = false
      setTimeout(() => this.$el.remove(), 500)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was pressed 1 time.</span>
  <button @click="dismiss()" type="button" aria-label="Dismiss">&times;</button>
</li>
```

<style>
  #notification_list {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding-left: 0;
    margin: 0;
  }
  #notification_list > li {
    display: flex;
    align-items: center;
    font-size: .875rem;
    background: var(--nc-bg-1);
    padding: 1rem;
    box-shadow: 0 10px 15px -3px var(--shadow), 0 4px 6px -4px var(--shadow);
    border-radius: .5rem;
    border: 1px solid var(--nc-bg-3);
  }
  #notification_list > li :first-child {
    flex: 1;
    margin-right: 2rem;
  }
</style>

<script>
  var count = 0;
  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /action': () => view(),
      'POST /action': () => {
        count++
        return view()
      }
    }).get('/action')
  })

  function view() {
    return `<form x-ajax id="action" method="post" action="/action">
  <button>Click Me</button>
</form>
<ul x-sync id="notification_list" role="status" aria-live="polite">
  ${count > 0 ? notification() : ''}
</ul>`
  }

  function notification() {
    return `<li key="${count}" x-data="{
      show: false,
      init() {
        this.$nextTick(() => this.show = true)
        setTimeout(() => this.dismiss(), 6000)
      },
      dismiss() {
        this.show = false
        setTimeout(() => this.$el.remove(), 500)
      }
    }"
    x-show="show"
    x-transition.duration.500ms
  >
    <span>The button was pressed ${count} ${count > 1 ? 'times' : 'time'}.</span>
    <button @click="dismiss()" type="button" aria-label="Dismiss">&times;</button>
  </li>`
  }

</script>

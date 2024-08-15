---
title: Notifications
eleventyNavigation:
  key: Notifications
  excerpt: Display notification “toasts”.
  order: 14
---

This demo shows how to implement notification "toasts".

This pattern starts with an empty list for our notifications, the list needs an `id` and `x-sync`. We've added `aria-live` to the list so that screen readers will read out new notifications when the are added to the list.

```html
<ul x-sync id="notification_list" role="status" aria-live="polite">
</ul>
```

We'll also add an AJAX form to this demo so that we can issue requests to the server that will trigger new notifications.

```html
<form id="action" x-init x-target method="post" action="/action">
  <button>Click Me</button>
</form>
```

When the AJAX form is submitted the server will respond with a new notification in the list:

```html
<ul x-sync id="notification_list" role="status" aria-live="polite">
  <li>
    <span>The button was clicked 1 time.</span>
  </li>
</ul>
```

Notice that our AJAX form **does not** target the `notification_list` element, however since our list has the `x-sync` attribute, it will automatically update any time the server responds with an element assigned `id="notification_list"`.

Our notifications should now be appearing with each form submission, however, every time the form is submitted the new incoming notification will replace the existing notification in our list of notifications; Essentially, our UI can only display a single notification at a time. Instead, we should prepend incoming notifications to our list so that older notifications aren't clobbered with each AJAX request. We can control how new content is added to our list using the `x-merge` attribute:

```html
<ul x-sync id="notification_list" x-merge="prepend" role="status" aria-live="polite">
```

The basic functionality of our notifications is complete, next there are a few refinements we can make to the notification messages to further improve the user experience. First, let's sprinkle in some additional Alpine code to animate our notifications:

```html
<li x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was clicked 1 time.</span>
</li>
```

Now our messages will smoothly transition in and out as they are added and removed from the notification list. Next, we can add a "Dismiss" button to each notification:

```html
<li x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
    },
    dismiss() {
      this.show = false
      setTimeout(() => this.$root.remove(), 500)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was clicked 1 time.</span>
  <button @click="dismiss" type="button" aria-label="Dismiss">&times;</button>
</li>
```

And finally, we can make our notifications automatically dismiss after 6 seconds, by adding a `setTimeout` in the `init` method:

```html
<li x-data="{
    show: false,
    init() {
      this.$nextTick(() => this.show = true)
      setTimeout(() => this.dismiss(), 6000)
    },
    dismiss() {
      this.show = false
      setTimeout(() => this.$root.remove(), 500)
    }
  }"
  x-show="show"
  x-transition.duration.500ms
>
  <span>The button was clicked 1 time.</span>
  <button @click="dismiss" type="button" aria-label="Dismiss">&times;</button>
</li>
```

<style>
  #notification_list {
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
    background: #fff;
    padding: 1rem;
    border: 1px solid #000;
  }
  #notification_list > li :first-child {
    flex: 1;
    margin-right: 2rem;
  }
</style>

<script type="module">
  var count = 0;

  window.route('GET', '/action', () => view())
  window.route('POST', '/action', () => {
    count++
    return view()
  })

  window.example('/action')

  function view() {
    return `<form id="action" x-init x-target method="post" action="/action">
  <button>Click Me</button>
</form>
<ul x-sync id="notification_list" x-merge="prepend" role="status" aria-live="polite">
  ${count > 0 ? notification() : ''}
</ul>`
  }

  function notification() {
    return `<li x-data="{
      show: false,
      init() {
        this.$nextTick(() => this.show = true)
        setTimeout(() => this.dismiss(), 6000)
      },
      dismiss() {
        this.show = false
        setTimeout(() => this.$root.remove(), 500)
      }
    }"
    x-show="show"
    x-transition.duration.500ms
  >
    <span>The button was clicked ${count} ${count > 1 ? 'times' : 'time'}.</span>
    <button @click="dismiss" type="button" aria-label="Dismiss">&times;</button>
  </li>`
  }
</script>

---
eleventyNavigation:
  key: x-autofocus
  url: /reference/#x-autofocus
  order: 6
---

## x-autofocus

When AJAX requests change content on the page it's important that you control keyboard focus to maintain [meaningful sequencing](https://www.w3.org/TR/WCAG21/#meaningful-sequence) and [focus order](https://www.w3.org/TR/WCAG21/#focus-order). `x-autofocus` will restore a user's keyboard focus when the content they were focused on is changed by an AJAX request.

Notice the `x-autofocus` attribute on this email `<input>`:

```html
<input type="email" name="email" x-autofocus />
```

This input will steal keyboard focus whenever it is inserted into the page by Alpine AJAX. Check out the [Toggle Button](/examples/toggle-button/) and [Inline Edit](/examples/inline-edit/) examples to see `x-autofocus` in action.

### Disabling autofocus

You may use the `nofocus` modifier on `x-target` to disable autofocus behavior. This can be useful in situations where you may need to hand over focus control to a  third-party script. In the following example we've disabled focus so that our dialog component can handle focus instead:

```html
<a href="/preview/1" x-target.nofocus="dialog_content" @ajax:before="$dispatch('dialog:open')">Open preview</a>
```

### The standard `autofocus` attribute

Alpine AJAX will also respect the standard `autofocus` attribute and treat it like `x-autofocus`. When AJAX content contains elements with both `x-autofocus` and `autofocus`. The element with `x-autofocus` will win focus.

### Using `morph` and focus

It's worth noting that `x-merge="morph"` is another way to preserve keyboard focus between content changes. However, there are cases when the DOM is transformed so much that the Morph algorithm is unable to reliably preserve focus state, so `x-autofocus` is a lot more predictable in most situations.

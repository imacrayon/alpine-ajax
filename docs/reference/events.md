---
eleventyNavigation:
  key: Events
  url: /reference/#events
  order: 9
---

## Events

You can listen for events to perform additional actions during the lifecycle of an AJAX request:

<div class="table">
<table>
  <thead>
    <th scope="col" width="117">Name</th>
    <th scope="col">Description</th>
  </thead>
  <tbody>
  <tr>
    <td><code>ajax:before</code></td>
    <td>Fired before any AJAX requests are made. If this event is canceled using <code>$event.preventDefault()</code> the request will be aborted.</td>
  </tr>
  <tr>
    <td><code>ajax:send</code></td>
    <td>Fired when an AJAX request is issued. <code>$event.details</code> contains the request’s options, modifying these options will override the underlying <code>fetch</code> call.</td>
  </tr>
    <tr>
    <td><code>ajax:redirect</code></td>
    <td>Fired when an AJAX request responds with a 300 class status code. <code>$event.detail</code> contains the server response data.</td>
  </tr>
  <tr>
    <td><code>ajax:success</code></td>
    <td>Fired when an AJAX request responds with a 200 or 300 class status code. <code>$event.detail</code> contains the server response data.</td>
  </tr>
  <tr>
    <td><code>ajax:error</code></td>
    <td>Fired when an AJAX request responds with a 400 or 500 class status code. <code>$event.detail</code> contains the server response data.</td>
  </tr>
  <tr>
    <td><code>ajax:sent</code></td>
    <td>Fired after any AJAX request receives a response.</td>
  </tr>
  <tr>
    <td><code>ajax:missing</code></td>
    <td>Fired if a matching target is not found in the response body. <code>$event.detail</code> contains the server response data. You may cancel this event using <code>$event.preventDefault()</code> to override the default behavior.</td>
  </tr>
  <tr>
    <td><code>ajax:merge</code></td>
    <td>Fired when new content is being merged into <code>$event.target</code>. You may override a merge using <code>$event.preventDefault()</code>. <code>$event.detail</code> contains the server <code>response</code> data, the <code>content</code> to merge, and a <code>merge()</code> method to continue the merge.</td>
  </tr>
  <tr>
    <td><code>ajax:merged</code></td>
    <td>Fired after new content was merged into <code>$event.target</code>.</td>
  </tr>
  <tr>
    <td><code>ajax:after</code></td>
    <td>Fired after all AJAX merging has settled. <code>$event.target</code> contains the server <code>response</code> data and a <code>render</code> array that contains the rendered targets.</td>
  </tr>
  </tbody>
</table>
</div>

Here's an example of aborting a form request when the user cancels a dialog prompt:

```html
<form id="delete_user" x-init x-target @ajax:before="confirm('Are you sure?') || $event.preventDefault()">
  <button>Delete User</button>
</form>
```

**Note:** The `ajax:success` and `ajax:error` events only convey the status code of an AJAX request. You'll probably find that [Server Events](/examples/server-events/) are better for triggering actions based on your server's response.

## Loading states

While an AJAX request is in progress there are a few loading states to be aware of:

  * If a form submission triggered the request, the form's submit button is automatically disabled, this prevents users from triggering additional network requests by accidentally double clicking the submit button.
  * During an AJAX request, `aria-busy="true"` is set on all targets of the request. This attribute can be used in CSS to provide a loading indicator, check out the [Loading Indicator example](/examples/loading) for more details.

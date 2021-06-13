# Alpine AJAX

The `x-ajax` directive allows an HTML element to make asynchronous HTTP requests and render the response to the page.

This plugin is still a work in progress, but basic functionality exists.

```html
<form x-ajax method="post" action="/search">
```

## Configuration

You can customize the request and response behavior using a configuration object.

```html
<form method="post" action="/search" x-ajax="{ target: '#searchResults', insert: 'replace' }">
```

Available configuration options:

Key | Description
---|---
action | The URL for the request. This is inherited from the `action` attribute for forms.
confirm | Shows a `confirm()` dialog before the AJAX request is made. If the dialog is canceled the request will not be issued.
event | The event that will trigger a HTTP request. This defaults to `submit` for forms and `click` for any other element.
insert | Defines the way content from a response is inserted into the target DOM element. Available values are:  `after`, `append`, `before`, `prepend`, `replace`, `update`. This defaults to `update` meaning the target's content will be updated to match the new content.
method | The HTTP verb used to make the request. This is inherited from the `method` attribute for forms and defaults to `GET` for any other element.
select | A selector string defining the content you want inserted from the response. By default the entire response will be inserted into the target element.
target | The `HTMLElement` or selector string where requested content will be inserted.

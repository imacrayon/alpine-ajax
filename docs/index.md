---
layout: layout.webc
---

# Alpine AJAX

A set of [Alpine.js](https://alpinejs.dev) directives that enable forms and links to make asynchronous HTTP requests and render the response to the page.

These directives empower you to progressively enhanced multi-page, server-rendedered, websites and create modern, dynamic, <abbr title="User Interface">UI<abbr>s with very little JavaScript.

The Alpine AJAX project values
  1. [Progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)
  2. HTML over JavaScript
  3. [Accessibility](https://www.w3.org/WAI/ARIA/apg/)

## An Introduction

Consider this simple form:

```html
<form method="post" action="/repos/1/star">
  <button>Star Repository</button>
</form>
```

When this form is submitted a `POST` request is issued to `/repos/1/star` and the content from the reponse is loaded into the browser window.

Now let's enhance this form with Alpine AJAX:

```html
<form x-data x-ajax id="star_repo" method="post" action="/repos/1/star">
```

These three new attributes change this form's behavior: Now, when this form is submitted, a `POST` request is issued to `/repos/1/star` and the form is replace with the element that has the `id` `star_repo` in the response's content. The browser window doesn't refresh, and UI state and keyboard focus are all preserved when content is changed.

This simple pattern of updating a piece of your frontend instead of the entire page can be expanded to create rich user experiences as demonstrated on the [Examples](/examples) page.

## Installation

You can use Alpine AJAX by either including it from a `<script>` tag or installing it via NPM:

### Via CDN

Include the CDN build of Alpine AJAX as a `<script>` tag, just make sure to include it **before** Alpine's core JS file.

```html
<script defer src="https://unpkg.com/@imacrayon/alpine-ajax"></script>
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### Via NPM

Install Alpine AJAX from NPM for use inside your bundle like so:

```bash
npm i @imacrayon/alpine-ajax
```

Then initialize it from your bundle:

```js
import Alpine from 'alpinejs'
import ajax from '@imacrayon/alpine-ajax'

window.Alpine = Alpine
Alpine.plugin(ajax)
```

Visit the [Reference](/reference) page to learn how Alpine AJAX works, and then check the [Examples](/examples) page to learn how to apply it.

## Prior Art

Alpine AJAX is inspired by these other awesome HTML-first projects:

* [HTMX](https://htmx.org)
* [Hotwire Turbo](https://turbo.hotwired.dev)
* [Unpoly](https://unpoly.com)
* [Trimmings](https://postlight.github.io/trimmings)
* [Laravel Livewire](https://laravel-livewire.com)
* [jQuery PJAX](https://pjax.herokuapp.com)

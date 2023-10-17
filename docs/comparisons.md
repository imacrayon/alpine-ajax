---
layout: page.njk
title: Comparisons
description: Compare Alpine AJAX to similar frameworks
eleventyNavigation:
  key: Comparisons
  order: 3
---

# Comparisons

What follows is a general guide that lays out some comparisons between Alpine AJAX and other similar libraries. The intention here is to give you some context around how Alpine AJAX sets itself apart and when it may or may not makes sense to use. All of the following libraries are awesome in their own right, and each one served as inspiration for Alpine AJAX.

* [HTMX](#htmx)
* [Hotwired Turbo](#hotwired-turbo)
* [Unpoly](#unpoly)
* [Laravel Livewire](#laravel-livewire)

## HTMX

[https://htmx.org](https://htmx.org)

Both HTMX and Alpine AJAX are server-agnostic, they'll integrate nicely with almost any server-side language and architecture. Even more, both Alpine AJAX and HTMX work with Alpine.js. In general the HTMX community encourages developers to use [_hyperscript](https://hyperscript.org/) in place of Alpine.js, but Alpine.js is still considered a good option for adding client-side interaction. Since Alpine AJAX is designed as an Alpine.js plugin, it follows Alpine.js conventions; so if you're already building apps with Alpine.js, Alpine AJAX will feel more familiar.

HTMX favors flexibility where as Alpine AJAX prefers [convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration). Beyond the low-level tooling that HTMX provides, the library isn't very prescriptive about how it should be used. The [HTMX documentation for updating content](https://htmx.org/examples/update-other-content/) is one example of the library's lack of opinion: It presents you with four different solutions and leaves it up to you to consider the trade-offs for each. In contrast, Alpine AJAX tries to provide you with more guidance so you can become productive faster without stumbling into common accessibility and progressive enhancement pitfalls.

HTMX weighs in at 14kB of JavaScript compared to only 4kB for Alpine AJAX.

## Hotwired Turbo

[https://turbo.hotwired.dev](https://turbo.hotwired.dev)

Turbo can be paired with almost any server-side language, however it holds strict opinions around response status codes, headers, and content; so it does require some back-end configuration to get started. In contrast, Alpine AJAX only requires that the server respond with HTML so you can be up and running more quickly. It's worth noting that Turbo is designed to work with the [Ruby on Rails](https://rubyonrails.org/) framework out of the box, so installation should be easy if you're building a Rails app.

For client-side interactions, Turbo works well with Alpine.js, however the Turbo community generally encourages developers to use [Stimulus](https://stimulus.hotwired.dev/).

Alpine AJAX enables functionality very similar to Turbo's `<turbo-frame>` Custom Element. However, the fact that Turbo uses Custom Elements creates some serious incompatibilities with HTML: [Updating table content is broken](https://github.com/hotwired/turbo/issues/48), so broken in fact that the Rails team [removed tables](https://github.com/hotwired/turbo/issues/48#issuecomment-1014695187) [from their templates](https://discuss.rubyonrails.org/t/back-again-after-a-long-time-rails-7-scaffolds-table-view/80967/2). The lack of table support is especially unfortunate because many CRUD-based apps make significant use of tables. Besides tables, Turbo Frames can make [other common integrations cumbersome as well](https://github.com/hotwired/turbo/pull/131#discussion_r731924782). Turbo's integration problems are a non-issue in Alpine AJAX because AJAX behavior is defined using HTML attributes instead of Custom Elements, these attributes can be safely applied to any HTML element.

Turbo communicates updates from the server to the client via Turbo Streams. Turbo Streams require that your server responds with different HTML content based on whether the client is making a "Turbo Request" or a regular HTTP request, this means you end up having to maintain two different sets of HTML templates for these two types of requests. The Rails community recommends using template partials to ease the burden of juggling multiple variants of the same page, but even with partials, using Turbo Streams can still feel like you're maintaining two versions of the same app. In comparison, Alpine AJAX requires no distinction between an AJAX request and regular HTTP request, and state changes are communicated to the frontend via [custom JavaScript events](/reference/#server-events) that can be mixed in with any standard HTML response.

One notable advantage to using the Hotwire framework is that it provides a workflow for transforming your website into a native mobile application, so if you intend to launch your website on Android and iOS platforms, Hotwired Turbo might be worth considering.

Turbo weighs in at 22kB of JavaScript compared to only 4kB for Alpine AJAX.

## Unpoly

[https://unpoly.com](https://unpoly.com)

Like Alpine AJAX, Unpoly is server-agnostic, but it also offers an optional server protocol for developers that want more server-side direction. Similarly, Unpoly encourages UI patterns which support progressive enhancement and accessibility.

Unpoly is a very comprehensive frontend framework; it has strong conventions and also comes with a few elements like loaders, modals, and popovers baked-in. Because Unpoly has such broad concerns, it requires more upfront commitment to get familiar with it's novel concepts like fragments and layers. It feels more akin to frameworks like Laravel Livewire and Phoenix LiveView than "drop-in" libraries like Alpine AJAX, HTMX. Unpoly has it's own APIs for event delegation and animations so you can make due without using a frontend library like Alpine.js, however [Unpoly's imperative API](https://unpoly.com/up.element) is arguably not as expressive as Alpine.js's terse, declarative syntax.

The core Unpoly library weighs in at 43kB of JavaScript plus 1kB of required CSS compared to only 18kB for Alpine.js and Alpine AJAX combined.

## Laravel Livewire

[https://laravel-livewire.com](https://laravel-livewire.com)

If you're building a Laravel app, Livewire provides a lot of convenience and a great developer experience. Livewire has invested a lot of work into making the experience feel first class, it's easy to get up and running, however its component-based architecture is a departure from standard Laravel conventions and will probably require some getting used to. In comparison, Alpine AJAX is server-agnostic, so you can start using it without any changes to your Laravel app; in fact you're encouraged to build your Laravel app first **without** Alpine AJAX, then sprinkle in Alpine AJAX at the end to enhance the user experience.

The lack of progressive enhancement in Livewire is another reason you might choose Alpine AJAX over Livewire. [When JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html) a Livewire app becomes completely unresponsive. In contrast, Alpine AJAX gracefully degrades, so your links and forms can continue to function just like any other server-rendered website.

Alpine.js was originally created as a companion to Laravel Livewire, so of course Alpine.js and Livewire pair flawlessly together for handling client-side interactions.

Livewire's JavaScript bundle weighs in at 43kB compared to only 4kB for Alpine AJAX.

---
layout: example.webc
title: Lazy Loading
---

This example shows how to lazily load an element on a page.

We start with a loading indicator that looks like this:

```html
<article id="post" x-data x-load="/posts/1">
  <svg class="loader" aria-label="Loading content">...</svg>
</article>
```

This loading indicator exists on the while we fetch the articles's content. You can use any CSS or SVG magic you'd like to create a fancy looking loading indicator.

The loaded content is then inserted into the UI once the request has succeeded:

```html
<article id="post">
   <header>...</header>
   <p>...</p>
</article>
```

<style>
  .loader {
    animation: loading 1s linear infinite;
    background-image: linear-gradient(90deg, var(--nc-bg-1), var(--nc-bg-2), var(--nc-bg-3), var(--nc-bg-1), var(--nc-bg-2));
    background-size: 600% 100%;
  }

  .loader svg {
    display: block;
  }

  @keyframes loading {
    0% {
      background-position: 100% 0%;
    }

    100% {
      background-position: 0% 0%;
    }
  }

  article {
    box-shadow: 0 10px 15px -3px var(--shadow), 0 4px 6px -4px var(--shadow);
    padding: 1rem;
    border-radius: .5rem;
  }

  article header {
    all: inherit;
    box-shadow: none;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  article header svg {
    border-radius: 100px;
    background: var(--nc-bg-3);
    color: var(--nc-lk-1);
  }

  article header p,
  article header time {
    margin: 0;
  }

  article header time {
    font-size: .875em;
  }

</style>


<script>
  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /posts': () => dashboard(),
      'GET /posts/1': () => new Promise(resolve => {
        setTimeout(() => resolve(post()), 2000)
      }),
    }).get('/posts')
  })

  function dashboard() {
    return `<article id="post" x-load="/posts/1">
  <svg class="loader" aria-label="Loading content" viewBox="0 0 442 107" fill="var(--nc-bg-1)" xmlns="http://www.w3.org/2000/svg">
    <path d="M442 79.1H0V65.5h412.4v-7.1H0V0h442v79.1Zm0 7.1V107H181.2v-7.1H0V86.2h442ZM50.1 24.6v7.2h53.3v-7.2H50.1Zm0-16.8v7.1h89.3V7.8H50.1ZM19.3 38.9c10.6 0 19.2-8.7 19.2-19.4C38.5 8.7 30 0 19.3 0A19.4 19.4 0 0 0 0 19.5c0 10.7 8.6 19.4 19.3 19.4Z" />
  </svg>
</article>`
  }

  function post() {
    return `<article id="post">
  <header>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
      <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
    </svg>
    <div>
      <p><strong>Finn Mertins</strong></p>
      <time>2 hours ago</time>
    </div>
  </header>
  <p>I'll fly the paper, as an airplane, down the bedroom ladder. It'll triple barrel-roll past the kitchen, open the fridge, and cook some eggs; then eat the eggs and unfold itself as it lays on the carpet in front of Marceline's door.</p>
</article>`
  }
</script>

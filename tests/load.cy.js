import { test, html } from './utils'

test('content is lazily loaded with x-init',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    // Injecting the component code after the intercept has
    // been setup because this request fires immediately.
    get('#root').then(([el]) => {
      el.innerHTML = `<div x-init="$ajax('/tests')" id="replace"></div>`
    })
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Loaded')
    })
  }
)

test('replaced content gets a source',
  html`<a href="/tests" x-target id="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#replace').should('have.attr', 'data-source')
    })
  }
)

test('referer header is set when [data-source] exists',
  html`<form x-target id="replace" method="post" action="/tests" data-source="/tests/other.html"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-target id="replace" method="post"><button></button></form>'
    }).as('response')
    get('button').click()
    wait('@response').then(network => {
      expect(network.request.headers.referer).to.contain('/tests/other.html')
    })
  }
)

test('action is set to referrer for naked form when [data-source] exists',
  html`<form x-target id="replace" data-source="/tests/other.html"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests/other.html', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('content is lazily loaded with a custom event trigger',
  html`<div x-data><div @button:clicked.window="$ajax('/tests')" id="replace"></div><button type="button" @click="$dispatch('button:clicked')"></button></div>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Loaded')
    })
  }
)

test('aria-busy is added to busy targets',
  html`<a href="/tests" x-target id="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      delay: 1000,
      statusCode: 200,
      body: '<h1 id="title">Success</h1><a href="/tests" x-target id="replace">Replaced</a>',
    }).as('response')
    get('a').click().should('have.attr', 'aria-busy')
    wait('@response').then(() => {
      get('a').should('not.have.attr', 'aria-busy')
    })
  }
)

test('aria-busy is removed from targets that are not replaced',
  html`<div id="append" x-merge="append"><a href="/tests" x-target="append">Link</a><div>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      delay: 1000,
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="append"><a href="/tests">Appended</a></div>',
    }).as('response')
    get('a').click()
    get('#append').should('have.attr', 'aria-busy')
    wait('@response').then(() => {
      get('#append').should('not.have.attr', 'aria-busy')
    })
  }
)

// Note: these targets are wrapped in a <div> on purpose. Cypress patches
// `removeAttribute` on <a> elements to intercept the `target` attribute and
// silently drops every other attribute name, so `aria-busy` can never be
// observed being removed from a link inside the test runner.
test('aria-busy is removed when the request fails to connect',
  html`<div id="replace"><a href="/tests" x-target="replace">Link</a></div>`,
  ({ intercept, get, wait }) => {
    cy.on('uncaught:exception', () => false)
    intercept('GET', '/tests', { forceNetworkError: true }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#replace').should('not.have.attr', 'aria-busy')
    })
  }
)

test('a GET request that fails to connect is not left in the cache',
  html`<div id="replace"><a href="/tests" x-target="replace">Link</a></div>`,
  ({ intercept, get, wait }) => {
    cy.on('uncaught:exception', () => false)
    intercept('GET', '/tests', { forceNetworkError: true }).as('failure')
    get('a').click()
    wait('@failure')
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<div id="replace">Replaced</div>',
    }).as('success')
    get('a').click()
    wait('@success').then(() => {
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('aria-busy is removed from root node when target is _none',
  html`<html><a href="/tests" x-target="_none">Link</a></html>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      delay: 1000,
      statusCode: 200,
      body: '',
    }).as('response')
    get('a').click()
    get('html').should('have.attr', 'aria-busy')
    wait('@response').then(() => {
      get('html').should('not.have.attr', 'aria-busy')
    })
  }
)

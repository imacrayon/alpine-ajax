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

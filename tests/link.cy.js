import { test, html } from './utils'

test('makes GET requests for link',
  html`<a href="/tests" x-target id="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('request URL is determined by link href',
  html`<a href="other.html" x-target id="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', 'other.html', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('target can be set in attribute',
  html`<div id="replace"></div><a href="/tests" x-target="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
      get('a').should('exist')
    })
  }
)

test('[x-headers] sets request headers',
  html`<div id="replace"></div><a href="/tests" x-target="replace" x-headers="() => ({ 'x-test': 'te' + 'st' })">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    wait('@response').its('request.headers').should('have.property', 'x-test', 'test')
  }
)

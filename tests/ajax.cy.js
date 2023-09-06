import { test, html } from './utils'

test('GET request data is added to the URL',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests?NAME=VALUE', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    // Injecting the component code after the intercept has been setup
    // because this request fires immediately
    get('#root').then(([el]) => {
      el.innerHTML = `<div x-init="$ajax('/tests', { body: { 'NAME': 'VALUE' } })" id="replace"></div>`
    })
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Loaded')
    })
  }
)

test('follows redirects by default',
  html`<button type="button" id="replace" x-init @click="$ajax('/tests', {
    method: 'POST',
  })"></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('does not follow redirects when followRedirects is disabled',
  html`<button type="button" id="replace" x-init @click="$ajax('/tests', {
    method: 'POST',
    targets: ['replace'],
    followRedirects: false,
  })"></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'Redirected')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  null,
  {
    followRedirects: true,
  }
)

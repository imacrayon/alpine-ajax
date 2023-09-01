import { test, html } from './utils'

test('does not follow redirects by default',
  html`<form x-init x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">ERROR</h1>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'ERROR')
    })
  }
)

test('does not follow redirects when followRedirects is disabled',
  html`<form x-init x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">ERROR</h1>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'ERROR')
    })
  },
  {
    followRedirects: false
  }
)

test('follows redirects when followRedirects is enabled',
  html`<form x-init x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  {
    followRedirects: true,
  }
)

test('default merge strategy can be changed',
  html`<form x-init x-target id="target" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Append</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', '<button></button>Append')
    })
  },
  {
    mergeStrategy: 'append',
  }
)

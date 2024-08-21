import { test, html } from './utils'

test('[ajax:before] event is fired',
  html`<p id="before">CHANGE ME</p><form x-target id="replace" @ajax:before="document.getElementById('before').textContent = 'Changed'" method="post" action="/tests"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="replace">Success</h1>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Success')
      get('#before').should('have.text', 'Changed')
    })
  }
)

test('[ajax:before] can cancel AJAX requests',
  html`<h1 id="title">Replace me</h1><form x-target="title" @ajax:before="$event.preventDefault()" method="post" action="/tests"><button></button></form>`,
  ({ intercept, get, wait }) => {
    cy.on('fail', (error, runnable) => {
      if (error.message.indexOf('Timed out retrying') !== 0) throw error
    })
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('button').click()
    wait('@response', {
      requestTimeout: 500,
    }).then(() => {
      get('#title').should('have.text', 'Replace me')
    })
  }
)

test('[ajax:send] can modify a request',
  html`<form x-target id="replace" method="post" @ajax:send="$event.detail.action = '/changed'"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/changed', {
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

test('[ajax:redirect] can handle redirects',
  html`
  <form x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait, location }) => {
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
  `
  import Alpine from '../../node_modules/alpinejs/dist/module.esm.js'
  import ajax from '../../dist/module.esm.js'

  window.Alpine = Alpine
  Alpine.start()

  document.addEventListener('ajax:redirect', (event) => {
    console.log(event.detail.url)
    window.location.href = event.detail.url
  })
  `
)

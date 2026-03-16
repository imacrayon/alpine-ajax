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

test('[ajax:after] event is fired when element stays present',
  html`<div x-init id="content-container" @ajax:after="$el.dataset.didChange='yes'" data-did-change="no">
    <p id="before" x-sync>CHANGE ME</p>
    <form
      x-target="before replace"
      x-merge="update"
      id="replace"
      method="post"
      action="/tests"
    >
      <button></button>
    </form>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<p id="before">Changed</p><span id="replace">Success</span>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Success')
      get('#before').should('have.text', 'Changed')
      get('#content-container').should('have.attr', 'data-did-change')
      get('#content-container').should('have.attr', 'data-did-change', 'yes')
    })
  }
)

test('[ajax:after] event is fired when element is removed',
  html`<div x-init id="content-container" x-merge="update" x-sync @ajax:after="$el.dataset.didChange='yes'" data-did-change="no">
    <p id="before">CHANGE ME</p>
    <form
      x-target="before"
      x-merge="update"
      id="replace"
      method="post"
      action="/tests"
    >
      <button></button>
    </form>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<div id="content-container"><p id="before">Changed</p><h1 id="replace">Success</h1></div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Success')
      get('#before').should('have.text', 'Changed')
      get('#content-container').should('have.attr', 'data-did-change')
      get('#content-container').should('have.attr', 'data-did-change', 'yes')
    })
  }
)

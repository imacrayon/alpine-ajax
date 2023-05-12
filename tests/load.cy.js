import { test, html } from './utils'

test('content is lazily loaded with x-init',
  html``,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    // Injecting the component code after the intercept has been setup
    // because this request fires immediately
    cy.get('#root').then(([el]) => {
      el.innerHTML = `<div x-init="$ajax('/tests')" id="replace"></div>`
    })
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Loaded')
    })
  }
)

test('replaced content gets a source',
  html`<a href="/tests" x-target id="replace">Link</a>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    cy.get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#replace').should('have.attr', 'data-source')
    })
  }
)

test('referer header is set when [data-source] exists',
  html`<form x-target id="replace" method="post" action="/tests" data-source="/tests/other.html"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-target id="replace" method="post"><button></button></form>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(network => {
      expect(network.request.headers.referer).to.contain('/tests/other.html')
    })
  }
)

test('action is set to referrer for naked form when [data-source] exists',
  html`<form x-target id="replace" data-source="/tests/other.html"><button></button></form>`,
  ({ get }) => {
    cy.intercept('GET', '/tests/other.html', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('content is lazily loaded with a custom event trigger',
  html`<div x-data><div @button:clicked.window="$ajax('/tests')" id="replace"></div><button type="button" @click="$dispatch('button:clicked')"></button></div>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Loaded')
    })
  }
)

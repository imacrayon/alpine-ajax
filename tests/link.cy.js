import { test, html } from './utils'

test('makes GET requests for link',
  html`<a href="/tests" x-ajax id="replace">Link</a>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('request URL is determined by link href',
  html`<a href="other.html" x-ajax id="replace">Link</a>`,
  ({ get }) => {
    cy.intercept('GET', 'other.html', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('target can be set in attribute',
  html`<div id="replace"></div><a href="/tests" x-ajax target="replace">Link</a>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
      cy.get('a').should('exist')
    })
  }
)

test('AJAX behavior is inherited by parent element',
  html`<div x-ajax id="replace"><a href="/tests">Link</a></div>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('AJAX behavior is ignored with noajax',
  html`<div x-ajax id="replace"><a noajax id="link" href="/tests">Link</a></div>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => cy.get('#title').should('exist'))
  }
)

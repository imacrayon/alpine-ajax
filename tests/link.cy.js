import { test, html } from './utils'

test('makes GET requests for link',
  html`<a href="/tests" x-target id="replace">Link</a>`,
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
  html`<a href="other.html" x-target id="replace">Link</a>`,
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
  html`<div id="replace"></div><a href="/tests" x-target="replace">Link</a>`,
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

import { test, html } from './utils'

test('makes GET requests for link',
  html`<a href="/tests" x-data x-ajax id="replace">Link</a>`,
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
  html`<a href="other.html" x-data x-ajax id="replace">Link</a>`,
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
  html`<div id="replace"></div><a href="/tests" x-data x-ajax x-target="replace">Link</a>`,
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
  html`<div x-data x-ajax id="replace"><a href="/tests">Link</a></div>`,
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
  html`<div x-data x-ajax id="replace"><a noajax id="link" href="/tests">Link</a></div>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('a').click()
    cy.wait('@response').then(() => cy.get('#title').should('exist'))
  }
)

test('AJAX links are progressively enhanced to buttons',
  html`<a x-data x-ajax id="replace" href="/tests">Link</a>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<div id="replace">Replaced</div>'
    }).as('response')
    cy.get('#replace')
      .should('have.attr', 'role', 'button')
      .should('have.attr', 'tabindex', '0')
      .should('have.attr', 'data-href', '/tests')
      .should('not.have.attr', 'href')
    cy.get('#replace').trigger('keydown', { keyCode: 32 })
    cy.wait('@response').then(() => cy.get('#replace').should('have.text', 'Replaced'))
  }
)

test('inserted links are progressively enhanced to buttons',
  html`<div x-data x-ajax x-target="replace"><h1 id="replace"></h1><a href="/tests">Link</a></div>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<a id="replace" href="/tests">Replaced</a>'
    }).as('response')
    cy.get('a').click()
    cy.wait('@response').then(() => {
      cy.get('#replace')
        .should('have.attr', 'role', 'button')
        .should('have.attr', 'tabindex', '0')
        .should('have.attr', 'data-href', '/tests')
        .should('not.have.attr', 'href')
      cy.get('#replace').trigger('keydown', { keyCode: 32 })
      cy.wait('@response').then(() => cy.get('#replace').should('have.text', 'Replaced'))
    })
  }
)

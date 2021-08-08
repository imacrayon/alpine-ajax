import { test, html } from '../utils'

test('makes GET requests for anchor',
    html`<a href="/" x-ajax id="replace">Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', '/', {
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

test('request URL is determined by anchor href',
    html`<a href="other.html" x-ajax id="replace">Click Me</a>`,
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

test('replaced target can be changed',
    html`<div id="replace"></div><a href="/" x-ajax="replace">Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', '/', {
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
    html`<div x-ajax id="replace"><a href="/">Click Me</a></div>`,
    ({ get }) => {
      cy.intercept('GET', '/', {
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

test('AJAX behavior is ignored with ajax-ignore',
    html`<div x-ajax id="replace"><a ajax-ignore id="link" href="/">Click Me</a></div>`,
    ({ get }) => {
      cy.intercept('GET', '/', {
        statusCode: 200,
        body: '<h1 id="title">Success</h1>'
      }).as('response')
      get('a').click()
      cy.wait('@response').then(() => cy.get('#title').should('exist'))
    }
)

import { test, html } from '../utils'

test('makes GET requests for naked form',
    html`<form x-ajax id="replace"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
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

test('makes GET requests for form',
    html`<form x-ajax id="replace" method="get"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
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

test('makes POST requests for form',
    html`<form x-ajax id="replace" method="post"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
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

test('makes PUT requests for form',
    html`<form x-ajax id="replace" method="put"><button></button></form>`,
    ({ get }) => {
      cy.intercept('PUT', 'spec.html', {
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

test('makes PATCH requests for form',
    html`<form x-ajax id="replace" method="patch"><button></button></form>`,
    ({ get }) => {
      cy.intercept('PATCH', 'spec.html', {
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

test('makes DELETE requests for form',
    html`<form x-ajax id="replace" method="delete"><button></button></form>`,
    ({ get }) => {
      cy.intercept('DELETE', 'spec.html', {
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

test('request URL is determined by action attribute',
    html`<form x-ajax id="replace" action="other.html"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'other.html', {
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

test('confirmation dialog is shown',
    html`<form x-ajax id="replace" ajax-confirm="Testing confirmation"><button></button></form>`,
    ({ get }) => {
      cy.on('window:confirm', message => cy.expect(message).to.equal('Testing confirmation'));
      get('button').click()
    }
)

test('replaced target can be changed',
    html`<div id="replace"></div><form x-ajax="replace" method="post" action="/"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
        statusCode: 200,
        body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
      }).as('response')
      get('button').click()
      cy.wait('@response').then(() => {
        cy.get('#title').should('not.exist')
        cy.get('#replace').should('have.text', 'Replaced')
        cy.get('form').should('exist')
      })
    }
)

test('AJAX behavior is inherited',
    html`<div x-ajax id="replace"><form method="post" action="/"><button></button></form></div>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
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

test('AJAX behavior is ignored with ajax-ignore',
    html`<div x-ajax id="replace"><form ajax-ignore method="post" action="/"><button></button></form></div>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
        statusCode: 200,
        body: '<h1 id="title">Success</h1>'
      }).as('response')
      get('button').click()
      cy.wait('@response').then(() => cy.get('#title').should('exist'))
    }
)

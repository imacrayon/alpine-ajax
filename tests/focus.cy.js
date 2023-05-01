import { test, html } from './utils'

test('focus is set with [x-focus] string',
  html`<form x-ajax id="replace" method="post" x-focus="toggle_button"><button aria-pressed="false">Like</button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-ajax id="replace" method="post"><button id="toggle_button" aria-pressed="true">Unlike</button></form>'
    }).as('response')
    get('button').focus().click()
    cy.wait('@response').then(() => {
      cy.get('button').should('have.focus')
    })
  }
)

import { test, html } from './utils'

test('focus is set with [x-focus] string',
  html`<form x-init x-target id="replace" method="post" x-focus="toggle_button"><button aria-pressed="false">Like</button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-target id="replace" method="post"><button id="toggle_button" aria-pressed="true">Unlike</button></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('button').should('have.focus')
    })
  }
)

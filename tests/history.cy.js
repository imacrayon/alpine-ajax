import { test, html } from './utils'

test('replaces the history state with the replace modifier',
  html`<form x-target.replace id="replace" method="get" action="/replaced"><button></button></form>`,
  ({ intercept, get, wait, location, go }) => {
    intercept('GET', '/replaced', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
      location('href').should('include', '/replaced');
    })
  }
)

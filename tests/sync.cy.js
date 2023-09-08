import { test, html } from './utils'

test('[x-sync] creates a passive target',
  html`<div id="sync" x-sync></div><a href="/tests" x-init x-target id="replace">Link</a>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div><div id="sync">Synced</div>'
    }).as('response')
    get('a').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#sync').should('have.text', 'Synced')
    })
  }
)

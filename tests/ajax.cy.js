import { test, html } from './utils'

test('GET request data is added to the URL',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests?NAME=VALUE', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    // Injecting the component code after the intercept has been setup
    // because this request fires immediately
    get('#root').then(([el]) => {
      el.innerHTML = `<div x-init="$ajax('/tests', { body: { 'NAME': 'VALUE' } })" id="replace"></div>`
    })
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Loaded')
    })
  }
)

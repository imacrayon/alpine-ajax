import { test, html, isSuccess } from '../utils'

test('configuration values are reactive',
    html`
      <div x-data="{ method: 'get' }">
        <button type="button" @click="method = 'post'"></button>
        <a x-ajax="{ method: method }" x-text="method"></a>
      </div>
    `,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      get('a').should('have.text', 'post').click()
      isSuccess()
    }
)

// TODO: Event listeners are removed when event configuration changes

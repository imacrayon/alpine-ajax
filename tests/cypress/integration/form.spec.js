import { test, html, isSuccess } from '../utils'

test('makes GET requests for form',
    html`<form method="get" x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('makes GET requests for naked form',
    html`<form x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('makes POST requests for form',
    html`<form method="post" x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('makes PUT requests for form',
    html`<form method="put" x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('PUT', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('makes PATCH requests for form',
    html`<form method="patch" x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('PATCH', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('makes DELETE requests for form',
    html`<form method="delete" x-ajax><button></button></form>`,
    ({ get }) => {
      cy.intercept('DELETE', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

test('form attributes override the config object',
    html`<form action="spec.html" method="post" x-ajax="{ method: 'get', action: 'bad.html' }"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('button').click()
      isSuccess()
    }
)

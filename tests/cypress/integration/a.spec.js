import { test, html, isSuccess } from '../utils'

test('makes GET requests for link',
    html`<a x-ajax="{ method: 'get' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('makes GET requests for naked link',
    html`<a x-ajax>Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('makes POST requests for link',
    html`<a x-ajax="{ method: 'post' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('makes PUT requests for link',
    html`<a x-ajax="{ method: 'put' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('PUT', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('makes PATCH requests for link',
    html`<a x-ajax="{ method: 'patch' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('PATCH', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('makes DELETE requests for link',
    html`<a x-ajax="{ method: 'delete' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('DELETE', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('request URL is determined by link href',
    html`<a href="other.html" x-ajax>Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', 'other.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

test('link href overrides the config action',
    html`<a href="spec.html" x-ajax="{ action: 'bad.html' }">Click Me</a>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
        statusCode: 200,
        body: '<h1>Success</h1>'
      }).as('response')
      get('a').click()
      isSuccess()
    }
)

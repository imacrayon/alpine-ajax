import { test, html } from './utils'

test('parallel GET requests are cached',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<div id="one">Success</div><div id="two">Success</div>'
    }).as('response')
    // Injecting the component code after the intercept has been setup
    // because this request fires immediately
    get('#root').then(([el]) => {
      el.innerHTML = `
      <div id="one" x-init="$ajax('/tests')"></div>
      <div id="two" x-init="$ajax('/tests')"></div>
      `
    })
    wait('@response').then(() => {
      get('#one').should('have.text', 'Success')
      get('#two').should('have.text', 'Success')
    })
    cy.get('@response.all').should('have.length', 1)
  }
)

test('staggered GET requests are NOT cached',
  html`<div x-init><button id="one" x-on:click="$ajax('/tests')"></button><button id="two" x-on:click="$ajax('/tests')"></button></div>`,
  ({ intercept, get, wait }) => {
    let state = 'ONE'
    intercept('GET', '/tests', {
      statusCode: 200,
      body: `<div x-init>
        <button id="one" x-on:click="$ajax('/tests')">ONE</button>
        <button id="two" x-on:click="$ajax('/tests')">ONE</button>
      </div>`
    }).as('response')
    get('#one').click()
    intercept('GET', '/tests', {
      statusCode: 200,
      body: `
        <div x-init><button id="one" x-on:click="$ajax('/tests')">TWO</button>
        <button id="two" x-on:click="$ajax('/tests')">TWO</button></div>
      `
    }).as('response')
    get('#two').click()
    wait('@response').then(() => {
      get('#one').should('have.text', 'ONE')
      get('#two').should('have.text', 'TWO')
    })
    cy.get('@response.all').should('have.length', 2)
  }
)

test('GET requests with different params are NOT cached',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests?NAME=ONE', {
      statusCode: 200,
      body: '<div id="one">ONE</div><div id="two">ONE</div>'
    }).as('response')
    intercept('GET', '/tests?NAME=TWO', {
      statusCode: 200,
      body: '<div id="two">TWO</div><div id="two">TWO</div>'
    }).as('response')
    // Injecting the component code after the intercept has been setup
    // because this request fires immediately
    get('#root').then(([el]) => {
      el.innerHTML = `
        <div x-init="$ajax('/tests', { body: { 'NAME': 'ONE' } })" id="one"></div>
        <div x-init="$ajax('/tests', { body: { 'NAME': 'TWO' } })" id="two"></div>
      `
    })
    wait('@response').then(() => {
      get('#one').should('have.text', 'ONE')
      get('#two').should('have.text', 'TWO')
    })
  }
)

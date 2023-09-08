import { test, html } from './utils'

test('content is merged before',
  html`<form x-init x-target id="target" method="post" x-merge="before"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target"><p>Before</p></div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').prev().should('have.html', 'Before')
    })
  }
)

test('merged content is prepended',
  html`<form x-init x-target id="target" method="post" x-merge="prepend"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Prepend</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', 'Prepend<button></button>')
    })
  }
)

test('merged content is updated',
  html`<form x-init x-target id="target" method="post" x-merge="update"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Update</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', 'Update')
    })
  }
)

test('merged content is appended',
  html`<form x-init x-target id="target" method="post" x-merge="append"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Append</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', '<button></button>Append')
    })
  }
)

test('content is merged after',
  html`<form x-init x-target id="target" method="post" x-merge="after"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target"><p>After</p></div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').next().should('have.html', 'After')
    })
  }
)

test('focus is maintained when merged content is morphed',
  html`<form x-init x-target id="replace" method="post" x-merge="morph"><button aria-pressed="false">Like</button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-target id="replace" method="post"><button aria-pressed="true">Unlike</button></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('button').should('have.focus')
    })
  }
)

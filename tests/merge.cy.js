import { test, html } from './utils'

test('content is merged before',
  html`<form x-target id="target" method="post" x-merge="before"><button></button></form>`,
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
  html`<form x-target id="target" method="post" x-merge="prepend"><button></button></form>`,
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
  html`<form x-target id="target" method="post" x-merge="update"><button></button></form>`,
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
  html`<form x-target id="target" method="post" x-merge="append"><button></button></form>`,
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
  html`<form x-target id="target" method="post" x-merge="after"><button></button></form>`,
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

test('table elements can be merged',
  html`<table><tr id="row"><td>Replace</td></tr></table><form x-target="row" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<tr id="row"><td>Replaced</td></tr>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('#row').should('have.text', 'Replaced')
    })
  }
)

test('merging can be interrupted',
  html`<form x-target id="target" method="post" @ajax:merge="$event.preventDefault()"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Replace</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', '<button></button>')
    })
  }
)

test('merged content can be changed',
  html`<form x-target id="target" method="post" @ajax:merge="$event.detail.content.innerHTML = 'Changed';"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<div id="target">Test</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#target').should('have.text', 'Changed')
    })
  }
)

test('merged strategy can be changed',
  html`<form x-target id="target" method="post" x-merge="after" x-on:ajax:merge="$event.detail.strategy = 'update'"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', 'Replaced')
    })
  }
)

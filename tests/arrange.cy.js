import { test, html } from './utils'

test('content is arranged before',
  html`<form x-target id="target" method="post" x-arrange="before"><button></button></form>`,
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

test('arranged content is prepended',
  html`<form x-target id="target" method="post" x-arrange="prepend"><button></button></form>`,
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

test('arranged content is updated',
  html`<form x-target id="target" method="post" x-arrange="update"><button></button></form>`,
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

test('arranged content is appended',
  html`<form x-target id="target" method="post" x-arrange="append"><button></button></form>`,
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

test('content is arranged after',
  html`<form x-target id="target" method="post" x-arrange="after"><button></button></form>`,
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

test('arranged content is removed',
  html`<form x-target id="target" method="post" x-arrange="remove"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target"><p>After</p></div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('not.exist')
    })
  }
)

test('focus is maintained when arranged content is morphed',
  html`<form x-target id="replace" method="post" x-arrange="morph"><button aria-pressed="false">Like</button></form>`,
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

import { test, html } from './utils'

test('can map response target to a different document target',
  html`<div id="replace" x-merge="update"></div><form x-target="replace:target"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Error</div><div id="target">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('can have multiple target mappings',
  html`<div id="replace_1" x-merge="update"></div><div id="replace_2" x-merge="update"></div><form x-target="replace_1:target_1 replace_2:target_2" method="post" action="/tests"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target_1">Replaced #1</div><div id="target_2">Replaced #2</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace_1').should('have.text', 'Replaced #1')
      get('#replace_2').should('have.text', 'Replaced #2')
      get('form').should('exist')
    })
  }
)

test('mapping can omit current element target',
  html`<form id="replace" x-target=":target" x-merge="update"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Error</div><div id="target">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('mapping can omit response element target',
  html`<div id="replace" x-merge="update"></div><form id="target" x-target="replace:"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Error</div><div id="target">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('target delimiter is optional',
  html`<div id="replace" x-merge="update"></div><form id="error" x-target="replace"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="error">Error</div><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

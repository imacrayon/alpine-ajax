import { test, html } from './utils'

test('focus is maintained when merged content is morphed',
  html`<form x-init x-target id="replace" method="post" x-merge="morph"><button aria-pressed="false">Like</button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-target id="replace" method="post"><button aria-pressed="true">Unlike</button></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('button').should('have.text', 'Unlike')
      get('button').should('have.focus')
    })
  },
  null,
  `
    import morph from '../../node_modules/@alpinejs/morph/dist/module.esm.js'
    import Alpine from '../../node_modules/alpinejs/dist/module.esm.js'
    import ajax from '../../dist/module.esm.js'

    Alpine.plugin(morph)
    Alpine.plugin(ajax)
    window.Alpine = Alpine
    Alpine.start()
  `
)

test('focus is set with [autofocus]',
  html`<form x-init x-target id="replace" method="post"><button>First</button><a href="#">Second</a></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-init x-target id="replace" method="post"><button>First</button><a href="#" autofocus>Second</a></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('a').should('have.focus')
    })
  }
)

test('focus is ignored with the nofocus modifier',
  html`<form x-init x-target.nofocus id="replace" method="post"><button>First</button><a href="#">Second</a></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-init x-target id="replace" method="post"><button>First</button><a href="#" autofocus>Second</a></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('a').should('not.have.focus')
    })
  }
)

test('first listed target is focused when multiple [autofocus] are merged',
  html`<a href="#" autofocus id="replace2">Second</a><a href="#" autofocus id="replace1">First</a><form x-init x-target="replace1 replace2" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<a href="#" autofocus id="replace2">Second Replaced</a><a href="#" autofocus id="replace1">First Replaced</a>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace1').should('have.focus')
    })
  }
)

test('hidden [autofocus] elements are ignored',
  html`<form x-init x-target id="replace" method="post"><button>First</button><a href="#">Second</a></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-init x-target id="replace" method="post"><button hidden autofocus>First</button><a href="#" autofocus>Second</a></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('a').should('have.focus')
    })
  }
)

test('[x-autofocus] overrides [autofocus]',
  html`<form x-init x-target id="replace" method="post"><button>First</button><a href="#">Second</a></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-init x-target id="replace" method="post"><button autofocus>First</button><a href="#" x-autofocus>Second</a></form>'
    }).as('response')
    get('button').focus().click()
    wait('@response').then(() => {
      get('a').should('have.focus')
    })
  }
)

import { test, html } from './utils'

function configure(options) {
  return `
  import Alpine from '../../node_modules/alpinejs/dist/module.esm.js'
  import ajax from '../../dist/module.esm.js'

  Alpine.plugin(ajax.configure(${JSON.stringify(options)}))
  window.Alpine = Alpine
  Alpine.start()
  `
}

test('default merge strategy can be changed',
  html`<form x-init x-target id="target" method="post"><button></button></form>`,
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
  },
  null,
  configure({
    mergeStrategy: 'append',
  })
)

test('default request headers can be set',
  html`<form x-init x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').its('request.headers').should('have.property', 'x-test', 'test')
  },
  null,
  configure({
    headers: { 'x-test': 'test' }
  })
)

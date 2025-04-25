import { html } from './utils';

function configure(config) {
  const params = new URLSearchParams();

  params.set('config', JSON.stringify(config))

  return params.toString();
}

export let test = function (name, template, callback, config) {
  it(
    name,
    () => {
      const urlWithConfig = '/tests/cdn.html?' + config

      cy.visit(urlWithConfig)
      cy.get('#root').then(([el]) => {
        el.innerHTML = template
      })
      callback(cy, urlWithConfig)
    }
  )

  it(
    `late: ${name}`,
    () => {
      const urlWithConfig = '/tests/cdn-late.html?' + config

      cy.visit(urlWithConfig)
      cy.get('#root').then(([el]) => {
        el.innerHTML = template
      })
      callback(cy, urlWithConfig)
    }
  )
}

test('default merge strategy can be changed',
  html`<form x-target id="target" method="post"><button></button></form>`,
  ({ intercept, get, wait }, config) => {
    intercept('POST', config, {
      statusCode: 200,
      body: '<div id="target">Prepend</div><h1 id="title">Success</h1>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', 'Prepend<button></button>')
    })
  },
  configure({
    mergeStrategy: 'prepend',
  })
)

test('default request headers can be set',
  html`<form x-target id="target" method="post"><button></button></form>`,
  ({ intercept, get, wait }, config) => {
    intercept('POST', config, {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="target">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').its('request.headers').should('have.property', 'x-alpine-nonce', 'test').then(() => {
      get('#title').should('not.exist')
      get('#target').should('have.html', 'Replaced')
    })
  },
  configure({
    headers: { 'X-Alpine-Nonce': 'test' }
  })
)

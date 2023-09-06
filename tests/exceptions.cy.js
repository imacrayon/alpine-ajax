import { test, html } from './utils'

test('Element throws an exception when a target is missing',
  html`<form x-init x-target="not_found" method="post" action="/tests"><button></button></form>`,
  ({ intercept, get }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
  },
  (err) => err.name === 'Missing Target'
)

test('Target throws an exception when it is missing an ID',
  html`<form x-init x-target method="post" action="/tests"><button></button></form>`,
  ({ intercept, get }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
  },
  (err) => err.name === 'Missing ID'
)

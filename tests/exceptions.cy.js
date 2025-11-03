import { test, html } from './utils'

test('Target throws an exception when it is missing an ID',
  html`<form x-target method="post" action="/tests"><button></button></form>`,
  ({ intercept, get }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
  },
  (err) => err.name === 'IDError'
)

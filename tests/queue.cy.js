import { test, html } from './utils'

test('skips rendering previous requests for the same target',
  html`
    <a href="/a" id="a" x-target="replace">A</a>
    <a href="/b" id="b" x-target="replace">B</a>
    <a href="/c" id="c" x-target="replace">C</a>
    <div id="replace"></div>
  `,
  ({ intercept, get, wait }) => {
    intercept('GET', '/a', (req) => {
      req.continue((res) => {
        res.setDelay(1000)
        res.send({
          statusCode: 200,
          body: '<div id="replace">A</div>'
        })
      })
    }).as('responseA')
    intercept('GET', '/b', (req) => {
      req.continue((res) => {
        res.setDelay(500)
        res.send({
          statusCode: 200,
          body: '<div id="replace">B</div>'
        })
      })
    }).as('responseB')
    intercept('GET', '/c', (req) => {
      req.continue((res) => {
        res.send({
          statusCode: 200,
          body: '<div id="replace">C</div>'
        })
      })
    }).as('responseC')
    get('#a').click()
    get('#b').click()
    get('#c').click()
    wait('@responseA').then(() => {
      get('#replace').should('have.text', 'C')
    })
  }
)

test('skips rendering previous requests targeting child elements',
  html`
    <a href="/child" x-target="child">Child</a>
    <a href="/parent"x-target="parent">Parent</a>
    <div id="parent">
      <div id="child"></div>
    </div>
  `,
  ({ intercept, get, wait }) => {
    intercept('GET', '/child', (req) => {
      req.continue((res) => {
        res.setDelay(500)
        res.send({
          statusCode: 200,
          body: '<div id="child">Replaced</div>'
        })
      })
    }).as('child')
    intercept('GET', '/parent', (req) => {
      req.continue((res) => {
        res.send({
          statusCode: 200,
          body: '<div id="parent"><div id="child">Parent Replaced</div></div>'
        })
      })
    }).as('parent')
    get('[href="/child"]').click()
    get('[href="/parent"]').click()
    wait('@child').then(() => {
      get('#parent').should('have.text', 'Parent Replaced')
      get('#child').should('have.text', 'Parent Replaced')
    })
  }
)

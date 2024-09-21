import { test, html } from './utils'

test('queues the latest request until the first request has rendered',
  html`
    <a href="/slowest" id="slowest" x-target="replace">Slowest</a>
    <a href="/slower" id="slower" x-target="replace">Slower</a>
    <a href="/slow" id="slow" x-target="replace">Slow</a>
    <div id="replace"></div>
  `,
  ({ intercept, get, wait, spy }) => {
    intercept('GET', '/slowest', spy((req) => {
      req.continue((res) => {
        res.setDelay(1000)
        res.send({
          statusCode: 200,
          body: '<div id="replace">Slowest</div>'
        })
      })
    }).as('slowest'))
    intercept('GET', '/slower', spy((req) => {
      req.continue((res) => {
        res.setDelay(500)
        res.send({
          statusCode: 200,
          body: '<div id="replace">Slower</div>'
        })
      })
    }).as('slower'))
    intercept('GET', '/slow', (req) => {
      req.continue((res) => {
        res.send({
          statusCode: 200,
          body: '<div id="replace">Slow</div>'
        })
      })
    }).as('response')
    get('#slowest').click()
    get('#slower').click()
    get('#slow').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Slow')
      cy.get('@slowest').should('have.been.called')
      cy.get('@slower').should('not.have.been.called')
    })
  }
)

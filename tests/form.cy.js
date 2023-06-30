import { test, html } from './utils'

test('makes GET requests for naked form',
  html`<form x-target id="replace"><button></button></form>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('makes GET requests for form',
  html`<form x-target id="replace" method="get"><button></button></form>`,
  ({ get }) => {
    cy.intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('makes POST requests for form',
  html`<form x-target id="replace" method="post"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('makes PUT requests for form',
  html`<form x-target id="replace" method="put"><button></button></form>`,
  ({ get }) => {
    cy.intercept('PUT', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('makes PATCH requests for form',
  html`<form x-target id="replace" method="patch"><button></button></form>`,
  ({ get }) => {
    cy.intercept('PATCH', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('makes DELETE requests for form',
  html`<form x-target id="replace" method="delete"><button></button></form>`,
  ({ get }) => {
    cy.intercept('DELETE', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('request URL is determined by action attribute',
  html`<form x-target id="replace" action="other.html"><button></button></form>`,
  ({ get }) => {
    cy.intercept('GET', '/tests/other.html', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('[x-target] changes the updated target',
  html`<div id="replace"></div><form x-target="replace" method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace').should('have.text', 'Replaced')
      cy.get('form').should('exist')
    })
  }
)

test('[x-target] can select multiple targets',
  html`<div id="replace_1"></div><div id="replace_2"></div><form x-target="replace_1 replace_2" method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace_1">Replaced #1</div><div id="replace_2">Replaced #2</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace_1').should('have.text', 'Replaced #1')
      cy.get('#replace_2').should('have.text', 'Replaced #2')
      cy.get('form').should('exist')
    })
  }
)

test('[x-target] handles extra whitespace',
  html`<div id="replace_1"></div><div id="replace_2"></div><form x-target="   replace_1    replace_2   " method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace_1">Replaced #1</div><div id="replace_2">Replaced #2</div>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('not.exist')
      cy.get('#replace_1').should('have.text', 'Replaced #1')
      cy.get('#replace_2').should('have.text', 'Replaced #2')
      cy.get('form').should('exist')
    })
  }
)

test('ajax:before event is fired',
  html`<p id="before">CHANGE ME</p><form x-init x-target id="replace" @ajax:before="document.getElementById('before').textContent = 'Changed'" method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="replace">Success</h1>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#replace').should('have.text', 'Success')
      cy.get('#before').should('have.text', 'Changed')
    })
  }
)

test('ajax:before can cancel AJAX requests',
  html`<h1 id="title">Replace me</h1><form x-init x-target="title" @ajax:before="$event.preventDefault()" method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.on('fail', (error, runnable) => {
      if (error.message.indexOf('Timed out retrying') !== 0) throw error
    })
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('button').click()
    cy.wait('@response', {
      requestTimeout: 500,
    }).then(() => {
      cy.get('#title').should('have.text', 'Replace me')
    })
  }
)

import { test, html } from './utils'

test('makes GET requests for naked form',
  html`<form x-ajax id="replace"><button></button></form>`,
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
  html`<form x-ajax id="replace" method="get"><button></button></form>`,
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
  html`<form x-ajax id="replace" method="post"><button></button></form>`,
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
  html`<form x-ajax id="replace" method="put"><button></button></form>`,
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
  html`<form x-ajax id="replace" method="patch"><button></button></form>`,
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
  html`<form x-ajax id="replace" method="delete"><button></button></form>`,
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
  html`<form x-ajax id="replace" action="other.html"><button></button></form>`,
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

test('x-target changes the updated target',
  html`<div id="replace"></div><div x-ajax><form x-target="replace" method="post" action="/tests"><button></button></form><div>`,
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

test('x-target can be inherited',
  html`<div id="replace"></div><div x-ajax x-target="replace"><form method="post" action="/tests"><button></button></form><div></div>`,
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

test('AJAX behavior is inherited',
  html`<div x-ajax id="replace"><form method="post" action="/tests"><button></button></form></div>`,
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

test('focus is maintained after elements are replaced',
  html`<form x-ajax id="replace" method="post"><button aria-pressed="false">Like</button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-ajax id="replace" method="post"><button aria-pressed="true">Unlike</button></form>'
    }).as('response')
    get('button').focus().click()
    cy.wait('@response').then(() => {
      cy.get('button').should('have.focus')
    })
  }
)

test('AJAX behavior is ignored with x-noajax',
  html`<div x-ajax id="replace"><form x-noajax method="post" action="/tests"><button></button></form></div>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => cy.get('#title').should('exist'))
  }
)

test('ajax:before event is fired',
  html`<h1 id="title">Replace me</h1><p id="before">Change me</p><form x-ajax x-target="title" @ajax:before="document.getElementById('before').textContent = 'Changed'" method="post" action="/tests"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(() => {
      cy.get('#title').should('have.text', 'Success')
      cy.get('#before').should('have.text', 'Changed')
    })
  }
)

test('ajax:before can cancel AJAX requests',
  html`<h1 id="title">Replace me</h1><form x-ajax x-target="title" @ajax:before="$event.preventDefault()" method="post" action="/tests"><button></button></form>`,
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

test('referer header is set when `data-source` exists',
  html`<form x-ajax id="replace" method="post" action="/tests" data-source="/tests/other.html"><button></button></form>`,
  ({ get }) => {
    cy.intercept('POST', '/tests', {
      statusCode: 200,
      body: '<form x-ajax id="replace" method="post"><button></button></form>'
    }).as('response')
    get('button').click()
    cy.wait('@response').then(network => {
      expect(network.request.headers.referer).to.contain('/tests/other.html')
    })
  }
)

test('action is set to referrer for naked form when `data-source` exists',
  html`<form x-ajax id="replace" data-source="/tests/other.html"><button></button></form>`,
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

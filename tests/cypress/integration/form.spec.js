import { test, html } from '../utils'

test('makes GET requests for naked form',
    html`<form x-data x-ajax id="replace"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" method="get"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" method="post"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" method="put"><button></button></form>`,
    ({ get }) => {
      cy.intercept('PUT', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" method="patch"><button></button></form>`,
    ({ get }) => {
      cy.intercept('PATCH', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" method="delete"><button></button></form>`,
    ({ get }) => {
      cy.intercept('DELETE', 'spec.html', {
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
    html`<form x-data x-ajax id="replace" action="other.html"><button></button></form>`,
    ({ get }) => {
      cy.intercept('GET', 'other.html', {
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

test('target can be set in attribute',
    html`<div id="replace"></div><form x-data x-ajax="replace" method="post" action="/"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
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
    html`<div x-data x-ajax id="replace"><form method="post" action="/"><button></button></form></div>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
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
    html`<form x-data x-ajax id="replace" method="post"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', 'spec.html', {
        statusCode: 200,
        body: '<form x-data x-ajax id="replace" method="post"><button></button></form>'
      }).as('response')
      get('button').focus().click()
      cy.wait('@response').then(() => {
        cy.get('button').should('have.focus')
      })
    }
)

test('AJAX behavior is ignored with noajax',
    html`<div x-data x-ajax id="replace"><form noajax method="post" action="/"><button></button></form></div>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
        statusCode: 200,
        body: '<h1 id="title">Success</h1>'
      }).as('response')
      get('button').click()
      cy.wait('@response').then(() => cy.get('#title').should('exist'))
    }
)

test('ajax:before event is fired',
    html`<h1 id="title">Replace me</h1><p id="before">Change me</p><form x-data x-ajax="title" x-on:ajax:before="document.getElementById('before').textContent = 'Changed'" method="post" action="/"><button></button></form>`,
    ({ get }) => {
      cy.intercept('POST', '/', {
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
    html`<h1 id="title">Replace me</h1><form x-data x-ajax="title" x-on:ajax:before="$event.preventDefault()" method="post" action="/"><button></button></form>`,
    ({ get }) => {
      cy.on('fail', (error, runnable) => {
        if (error.message.indexOf('Timed out retrying') !== 0) throw error
      })
      cy.intercept('POST', '/', {
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

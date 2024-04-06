import { test, html } from './utils'

test.skip('follows redirects by default',
  html`<form x-init x-target id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test.skip('follow modifier has no affect when followRedirects is enabled',
  html`<form x-init x-target.follow id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  null,
  {
    followRedirects: true,
  }
)

test.skip('nofollow modifier does not follow redirects when followRedirects is enabled',
  html`<form x-init x-target.nofollow id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'Redirected')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  null,
  {
    followRedirects: true,
  }
)

test.skip('follow modifier follows redirects when followRedirects is disabled',
  html`<form x-init x-target.follow id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  null,
  {
    followRedirects: false,
  }
)

test.skip('nofollow modifier has no affect when followRedirects is disabled',
  html`<form x-init x-target.nofollow id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/redirect', 302)
    })
    intercept('GET', '/redirect', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'Redirected')
      get('#replace').should('have.text', 'Replaced')
    })
  },
  null,
  {
    followRedirects: false,
  }
)

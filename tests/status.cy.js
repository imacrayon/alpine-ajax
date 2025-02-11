import { test, html } from './utils'

test('change target on 201 status',
  html`<form x-target x-target.201="success" id="replace" method="post"><div id="success"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 201,
      body: '<h1 id="title">Created</h1><div id="success">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target on 2xx status',
  html`<form x-target x-target.2xx="success" id="replace" method="post"><div id="success"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 201,
      body: '<h1 id="title">Created</h1><div id="success">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target on 404 status',
  html`<form x-target x-target.404="error" id="replace" method="post"><div id="error"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 404,
      body: '<h1 id="title">Not Found</h1><div id="error">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target on 4xx status',
  html`<form x-target x-target.4xx="error" id="replace" method="post"><div id="error"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 422,
      body: '<h1 id="title">Not Found</h1><div id="error">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target on 4xx or 201 status',
  html`<form x-target x-target.4xx.201="error" id="replace" method="post"><div id="error"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 201,
      body: '<h1 id="title">Created</h1><div id="error">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target on error status',
  html`<form x-target x-target.error="error" id="replace" method="post"><div id="error"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 500,
      body: '<h1 id="title">Not Found</h1><div id="error">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('change target when redirected back using back status',
  html`<form x-target x-target.back="redirect" id="replace" method="post"><div id="redirect"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/tests', 302)
    })
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="redirect">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('do not change target when redirected away using back status',
  html`<form x-target x-target.back="redirect" id="replace" method="post"><div id="redirect"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/away', 302)
    })
    intercept('GET', '/away', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="redirect">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace').should('not.exist')
    })
  }
)

test('change target when redirected away using back away',
  html`<form x-target x-target.away="redirect" id="replace" method="post"><div id="redirect"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/away', 302)
    })
    intercept('GET', '/away', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="redirect">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('do not change target when redirected back using back away',
  html`<form x-target x-target.away="redirect" id="replace" method="post"><div id="redirect"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/tests', 302)
    })
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="redirect">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#replace').should('not.exist')
    })
  }
)

test('more specific status modifiers win over general modifiers',
  html`<form x-target x-target.404="not_found" x-target.4xx.error="error" id="replace" method="post"><button></button></form><div id="not_found"></div><div id="error"></div>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 404,
      body: '<h1 id="title">Not Found</h1><div id="not_found">Replaced</div><div id="error">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#not_found').should('have.text', 'Replaced')
      get('#error').should('not.have.text', 'Replaced')
    })
  }
)

test('redirect statuses are fuzzy matched',
  html`<form x-target x-target.301="redirect" id="replace" method="post"><div id="redirect"></div><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 302,
      body: '<h1 id="title">Redirected</h1><div id="redirect">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('follows redirects by default',
  html`<form x-target id="replace" method="post"><button></button></form>`,
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

test('targeting `_self` will reload the page',
  html`<form x-target x-target.302="_self" id="replace" method="post"><button></button></form>`,
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
  }
)

test('targeting `_self` will not reload the page when redirected back to the same URL',
  html`<form x-target x-target.302="_self" id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/tests', 302)
    })
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Validation Error</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Validation Error')
    })
  }
)

test('targeting `_top` will reload the page',
  html`<form x-target x-target.302="_top" id="replace" method="post"><button></button></form>`,
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
  }
)

test('targeting `_top` will reload the page when redirected back to the same URL',
  html`<form x-target x-target.302="_top" id="replace" method="post"><button></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/tests', 302)
    })
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Redirected</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#title').should('have.text', 'Redirected')
      get('#replace').should('have.text', 'Replaced')
    })
  }
)

test('targeting `_none` will do nothing',
  html`<form method="post" x-target x-target.302="_none" id="replace"
    @ajax:success="document.getElementById('button').textContent = 'Success'"
    @ajax:missing="document.getElementById('button').textContent = 'Missing'"
    @ajax:merge="document.getElementById('button').textContent = 'Merge'"
  ><button id="button"></button></form>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', (request) => {
      request.redirect('/tests', 302)
    })
    intercept('GET', '/tests', {
      statusCode: 200,
      body: '<div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').then(() => {
      get('#button').should('exist')
      get('#button').should('have.text', 'Success')
    })
  }
)

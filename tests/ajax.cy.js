import { test, html } from './utils'

test('GET request data is added to the URL',
  html``,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests?NAME=VALUE', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Loaded</div>'
    }).as('response')
    // Injecting the component code after the intercept has
    // been setup because this request fires immediately.
    get('#root').then(([el]) => {
      el.innerHTML = `<div x-init="$ajax('/tests', { body: { 'NAME': 'VALUE' } })" id="replace"></div>`
    })
    wait('@response').then(() => {
      get('#title').should('not.exist')
      get('#replace').should('have.text', 'Loaded')
    })
  }
)

test('custom headers can be set through options',
  html`<button type="button" id="replace" x-init @click="$ajax('/tests', {
    method: 'POST',
    headers: { 'X-Test': 'test' }
  })"></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">Replaced</div>'
    }).as('response')
    get('button').click()
    wait('@response').its('request.headers').should('have.property', 'x-test', 'test')
  }
)

test('follows redirects by default',
  html`<button type="button" id="replace" x-init @click="$ajax('/tests', {
    method: 'POST',
  })"></button>`,
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

test('can upload files with $ajax method',
  html`<button type="button" id="replace" x-init @click="
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    $ajax('/tests', {
      method: 'POST',
      body: file
    })
  "></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">File uploaded</div>'
    }).as('response')
    get('button').click()
    wait('@response').then((interception) => {
      // Verify the request body is a File
      expect(interception.request.body).to.be.equal('test content')
    })
})

test('can upload string with $ajax method',
  html`<button type="button" id="replace" x-init @click="
    const text = 'test content';
    $ajax('/tests', {
      method: 'POST',
      body: text
    })
  "></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">File uploaded</div>'
    }).as('response')
    get('button').click()
    wait('@response').then((interception) => {
      // Verify the request body is a File
      expect(interception.request.body).to.be.equal('test content')
    })
})

test('can transform object to FormData with $ajax method',
  html`<button type="button" id="replace" x-init @click="
    const obj = { key: 'value', arr: [1,2], nested: { a: 'b' } };
    $ajax('/tests', {
      method: 'POST',
      body: obj
    })
  "></button>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      body: '<h1 id="title">Success</h1><div id="replace">File uploaded</div>'
    }).as('response')
    get('button').click()
    wait('@response').then((interception) => {
      // Verify the request body is a FormData with the correct entries
      expect(interception.request.body).to.include('key=value')
      expect(interception.request.body).to.include('arr='+encodeURIComponent(JSON.stringify([1,2]))) // arr=[1,2]
      expect(interception.request.body).to.include('nested='+encodeURIComponent(JSON.stringify({ a: 'b' }))) // nested={"a":"b"}
    })
})

test('$ajax assigns JSON response to object target',
  html`<div x-data="{ user: { name: '' } }" x-init>
    <button type="button" id="btn" @click="$ajax('/tests', { target: user })"></button>
    <span id="result" x-text="user.name"></span>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice' })
    }).as('response')
    get('#btn').click()
    wait('@response').then(() => {
      get('#result').should('have.text', 'Alice')
    })
  }
)

test('$ajax does not modify DOM when target is an object',
  html`<div x-data="{ data: {} }" x-init>
    <button type="button" id="btn" @click="$ajax('/tests', { target: data })"></button>
    <div id="replace">Original</div>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('GET', '/tests', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 42 })
    }).as('response')
    get('#btn').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Original')
    })
  }
)

test('[x-target:dynamic] assigns JSON response to object target',
  html`<div x-data="{ result: { name: '' } }" x-init>
    <form x-target:dynamic="result" method="post" action="/tests">
      <button id="btn"></button>
    </form>
    <span id="result" x-text="result.name"></span>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' })
    }).as('response')
    get('#btn').click()
    wait('@response').then(() => {
      get('#result').should('have.text', 'Bob')
    })
  }
)

test('[x-target:dynamic] does not modify DOM when target is an object',
  html`<div x-data="{ data: {} }" x-init>
    <form x-target:dynamic="data" method="post" action="/tests">
      <button id="btn"></button>
    </form>
    <div id="replace">Original</div>
  </div>`,
  ({ intercept, get, wait }) => {
    intercept('POST', '/tests', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 42 })
    }).as('response')
    get('#btn').click()
    wait('@response').then(() => {
      get('#replace').should('have.text', 'Original')
    })
  }
)

export function html(strings) {
  return strings.raw[0]
}

export let test = function (name, template, callback, exceptionTest, ajaxConfig) {
  it(name, () => {
    injectHtmlAndBootAlpine(cy, template, callback, exceptionTest, ajaxConfig)
  })
}

test.skip = (name, template, callback, handleExpectedErrors = false) => {
  it.skip(name, () => {
    injectHtmlAndBootAlpine(cy, template, callback, undefined, handleExpectedErrors)
  })
}

function injectHtmlAndBootAlpine(cy, template, callback, exceptionTest, ajaxConfig) {
  let exceptionHandler = exceptionTest ? ((err) => !exceptionTest(err)) : (() => true)
  cy.on('uncaught:exception', exceptionHandler)

  cy.visit('/tests')

  cy.get('#root').then(([el]) => {
    el.innerHTML = template
    el.bootAlpine(ajaxConfig)

    if (!exceptionTest) {
      cy.get('[alpine-is-ready]', { timeout: 5000 }).should('be.visible')
    }

    // We can't just simply reload a page from a test, because we need to
    // re-inject all the templates and such. This is a helper to allow
    // a test-subject method to perform a redirect all on their own.
    let reload = () => {
      cy.reload()

      cy.get('#root').then(([el]) => {
        el.innerHTML = template
        el.bootAlpine(ajaxConfig)
        cy.get('[alpine-is-ready]', { timeout: 5000 }).should('be.visible')
      })
    }

    callback(cy, reload)
  })
}

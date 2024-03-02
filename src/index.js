import './polyfills'
import { send } from './send'

let globalConfig = {
  followRedirects: true,
  headers: {},
  mergeStrategy: 'replace',
}
let sendConfig = new WeakMap()
let mergeConfig = new WeakMap()

let morphElement = (from, to) => {
  console.error(`You can't use the "morph" merge without first installing the Alpine "morph" plugin here: https://alpinejs.dev/plugins/morph`)
};

function Ajax(Alpine) {
  if (Alpine.morph) morphElement = Alpine.morph
  window.addEventListener('popstate', (e) => {
    if (!e.state || !e.state.__AJAX__) return

    window.location.reload(true)
  })

  Alpine.directive('target', (el, { modifiers, expression }, { evaluate, cleanup }) => {
    let config = {
      targets: parseIds(el, expression),
      events: true,
      ...parseModifiers(modifiers)
    }

    sendConfig.set(el, config)

    config.headers = Object.assign(
      globalConfig.headers,
      evaluate(Alpine.bound(el, 'x-headers', '{}'))
    )

    if (isLocalLink(el)) {
      cleanup(listenForNavigate(el, config))
    } else if (isForm(el)) {
      cleanup(listenForSubmit(el, config))
    }
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge')}]`)

  Alpine.directive('merge', (el, { modifiers, expression }) => {
    mergeConfig.set(el, {
      strategy: expression,
      transition: transition(modifiers)
    })
  })

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      let method = options.method ? options.method.toUpperCase() : 'GET'
      let enctype = options.enctype || 'application/x-www-form-urlencoded'
      let body = null

      if (options.body) {
        body = parseFormData(options.body)
        if (method === 'GET') {
          action = mergeBodyIntoAction(body, action)
          body = null
        } else if (enctype !== 'multipart/form-data') {
          body = formDataToParams(body)
        }
      }

      let headers = options.headers
      if (!headers) {
        headers = el.hasAttribute('x-headers')
          ? Alpine.evaluate(el, Alpine.bound(el, 'x-headers', '{}'))
          : {}
      }
      headers = Object.assign(globalConfig.headers, headers)

      let request = {
        action,
        method,
        body,
        headers,
        referrer: source(el),
      }

      let config = sendConfig.get(el) || {
        followRedirects: globalConfig.followRedirects,
        history: false,
        focus: false,
      }
      config = Object.assign(config, options)

      let ids = parseIds(el, config.targets || config.target)
      let targets = findTargets(ids)
      targets = config.sync ? addSyncTargets(targets) : targets

      return render(request, targets, el, config)
    }
  })
}

Ajax.configure = (options) => {
  globalConfig = Object.assign(globalConfig, options)

  return Ajax
}

export default Ajax

function parseIds(el, expression = null) {
  let ids = [el.id]
  if (expression) {
    ids = Array.isArray(expression) ? expression : expression.split(' ')
  }
  ids = ids.filter(id => id)

  if (ids.length === 0) {
    throw new MissingIdError(el)
  }

  return ids
}

function parseModifiers(modifiers = []) {
  let followRedirects = globalConfig.followRedirects
    ? !modifiers.includes('nofollow')
    : modifiers.includes('follow')

  let history = false;
  if (modifiers.includes('push')) history = 'push'
  if (modifiers.includes('replace')) history = 'replace'

  return {
    followRedirects,
    history,
    focus: !modifiers.includes('nofocus')
  }
}

function transition(modifiers = []) {
  return globalConfig.transitions || modifiers.includes('transition')
}

function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

function isForm(el) {
  return el.tagName === 'FORM'
}

function parseFormData(data) {
  if (data instanceof HTMLFormElement) return new FormData(data)
  if (data instanceof FormData) return data

  const formData = new FormData()
  for (let key in data) {
    if (typeof data[key] === 'object') {
      formData.append(key, JSON.stringify(data[key]))
    } else {
      formData.append(key, data[key])
    }
  }

  return formData
}

function listenForNavigate(el, config) {
  let handler = async (event) => {
    if (event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    let request = navigateRequest(el)
    request.headers = config.headers || {}
    let targets = addSyncTargets(findTargets(config.targets))

    try {
      return await render(request, targets, el, config)
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message)
        window.location.href = el.href
        return
      }

      throw error
    }
  }

  el.addEventListener('click', handler)

  return () => el.removeEventListener('click', handler)
}

function navigateRequest(link) {
  return {
    method: 'GET',
    action: link.href,
    referrer: source(link),
    body: null
  }
}

function listenForSubmit(el, config) {
  let handler = async (event) => {
    if (event.submitter && event.submitter.hasAttribute('formnoajax')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    let request = formRequest(el, event.submitter)
    request.headers = config.headers || {}
    let targets = addSyncTargets(findTargets(config.targets))

    try {
      return await withSubmitter(event.submitter, () => {
        return render(request, targets, el, config)
      })
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message)
        el.removeEventListener('submit', handler)
        el.requestSubmit(event.submitter)
        return
      }

      throw error
    }
  }

  el.addEventListener('submit', handler)

  return () => el.removeEventListener('submit', handler)
}

function formRequest(form, submitter = null) {
  let method = (form.getAttribute('method') || 'GET').toUpperCase()
  let enctype = form.getAttribute('enctype') || 'application/x-www-form-urlencoded'
  let referrer = source(form)
  let action = form.getAttribute('action') || referrer || window.location.href
  let body = parseFormData(form)
  if (submitter) {
    method = submitter.getAttribute('formmethod') || method
    enctype = submitter.getAttribute('formenctype') || enctype
    action = submitter.getAttribute('formaction') || action
    if (submitter.name) {
      body.append(submitter.name, submitter.value)
    }
  }
  if (method === 'GET') {
    action = mergeBodyIntoAction(body, action)
    body = null
  } else if (enctype !== 'multipart/form-data') {
    body = formDataToParams(body)
  }

  return { method, action, body, referrer }
}

async function withSubmitter(submitter, callback) {
  if (!submitter) return await callback()

  let disableEvent = e => e.preventDefault()

  submitter.setAttribute('aria-disabled', 'true')
  submitter.addEventListener('click', disableEvent)

  let result = await callback()

  submitter.removeAttribute('aria-disabled')
  submitter.removeEventListener('click', disableEvent)

  return result
}

function mergeBodyIntoAction(body, action) {
  let params = formDataToParams(body)

  if (Array.from(params).length) {
    let parts = action.split('#')
    let hash = parts[1]
    action += parts[0].includes('?') ? '&' : '?'
    action += params
    if (hash) {
      action += '#' + hash
    }

  }

  return action
}

function formDataToParams(body) {
  let params = Array.from(body.entries()).filter(([key, value]) => {
    return !(value instanceof File)
  })

  return new URLSearchParams(params)
}

async function render(request, targets, el, config) {

  let dispatch = () => true
  if (config.events) {
    dispatch = (el, name, detail) => {
      return el.dispatchEvent(
        new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
    }
  }

  if (!dispatch(el, 'ajax:before')) return

  let targetIds = []
  targets.forEach(target => {
    target.setAttribute('aria-busy', 'true')
    targetIds.push(target.id)
  })

  request.headers['X-Alpine-Request'] = 'true'
  request.headers['X-Alpine-Target'] = targetIds.join('  ')
  let response = await send(request, config.followRedirects)

  if (response.ok) {
    dispatch(el, 'ajax:success', response)
  } else {
    dispatch(el, 'ajax:error', response)
  }

  dispatch(el, 'ajax:after', response)

  if (!response.html) return

  if (config.history) {
    updateHistory(config.history, response.url)
  }

  let wrapper = document.createRange().createContextualFragment('<template>' + response.html + '</template>')
  let fragment = wrapper.firstElementChild.content
  let focused = !config.focus
  let renders = targets.map(async target => {
    let content = fragment.getElementById(target.id)
    let strategy = mergeConfig.get(target)?.strategy || globalConfig.mergeStrategy
    if (!content) {
      if (!dispatch(el, 'ajax:missing', { response, fragment })) {
        return
      }

      if (response.ok) {
        return target.remove();
      }

      throw new FailedResponseError(el)
    }

    let mergeTarget = async () => {
      let merged = await merge(strategy, target, content)

      if (merged) {
        merged.dataset.source = response.url
        merged.removeAttribute('aria-busy')
        if (!focused) {
          ['[x-autofocus]', '[autofocus]'].forEach(selector => {
            if (focused) return
            let autofocus = merged.matches(selector) ? merged : merged.querySelector(selector)
            if (autofocus) {
              focusOn(autofocus)
              focused = true
            }
          })
        }
      }

      dispatch(merged, 'ajax:merged')

      return merged
    }

    if (!dispatch(target, 'ajax:merge', { strategy, content, merge: mergeTarget })) {
      return
    }

    return mergeTarget()
  })

  return await Promise.all(renders)
}

async function merge(strategy, from, to) {
  let strategies = {
    before(from, to) {
      from.before(...to.childNodes)

      return from
    },
    replace(from, to) {
      from.replaceWith(to)

      return to
    },
    update(from, to) {
      from.replaceChildren(...to.childNodes)

      return from
    },
    prepend(from, to) {
      from.prepend(...to.childNodes)

      return from
    },
    append(from, to) {
      from.append(...to.childNodes)

      return from
    },
    after(from, to) {
      from.after(...to.childNodes)

      return from
    },
    morph(from, to) {
      morphElement(from, to)

      return document.getElementById(to.id)
    }
  }

  if (!mergeConfig.get(from)?.transition || !document.startViewTransition) {
    return strategies[strategy](from, to)
  }

  let merged = null
  let transition = document.startViewTransition(() => {
    merged = strategies[strategy](from, to)
    return Promise.resolve()
  })
  await transition.updateCallbackDone

  return merged
}

function focusOn(el) {
  if (!el) return
  setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.focus()
  }, 0)
}

function updateHistory(strategy, url) {
  let strategies = {
    push: () => window.history.pushState({ __AJAX__: true }, '', url),
    replace: () => window.history.replaceState({ __AJAX__: true }, '', url),
  }

  return strategies[strategy]();
}

function findTargets(ids = []) {
  return ids.map(id => {
    let target = document.getElementById(id)
    if (!target) {
      throw new MissingTargetError(id)
    }

    return target
  })
}

function addSyncTargets(targets) {
  document.querySelectorAll('[x-sync]').forEach(el => {
    if (!el.id) {
      throw new MissingIdError(el)
    }

    if (!targets.some(target => target.id === el.id)) {
      targets.push(el)
    }
  })

  return targets
}

function source(el) {
  return el.closest('[data-source]')?.dataset.source
}

class MissingIdError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`)
    this.name = 'Missing ID'
  }
}

class MissingTargetError extends Error {
  constructor(id) {
    super(`#${id} was not found in the current document.`)
    this.name = 'Missing Target'
  }
}

class FailedResponseError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} received a failed response.`)
    this.name = 'Failed Response'
  }
}

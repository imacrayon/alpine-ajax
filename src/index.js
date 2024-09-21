let settings = {
  headers: {},
  mergeStrategy: 'replace',
  transitions: false,
}

let doMorph = (from, to) => {
  console.error(`You can't use the "morph" merge without first installing the Alpine "morph" plugin here: https://alpinejs.dev/plugins/morph`)
}

function Ajax(Alpine) {
  if (Alpine.morph) doMorph = Alpine.morph

  Alpine.addInitSelector(() => `[${Alpine.prefixed('target')}]`)
  Alpine.addInitSelector(() => `[${Alpine.prefixed('target\\.push')}]`)
  Alpine.addInitSelector(() => `[${Alpine.prefixed('target\\.replace')}]`)
  Alpine.directive('target', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setTarget = (ids) => {
      el.__ajax_target = el.__ajax_target || {}
      let plan = {
        ids: parseIds(el, ids),
        sync: true,
        focus: !modifiers.includes('nofocus'),
        history: modifiers.includes('push') ? 'push' : (modifiers.includes('replace') ? 'replace' : false),
      }

      let statues = modifiers.filter((modifier) => modifier === 'error' || parseInt(modifier))
      statues = statues.length ? statues : ['xxx']
      statues.forEach(status => {
        // Redirect status codes are opaque to fetch
        // so we just use the first 3xx status given.
        if (status.charAt(0) === '3') {
          status = '3xx'
        }

        el.__ajax_target[status] = plan
      })
    }

    if (value === 'dynamic') {
      let evaluate = evaluateLater(expression)
      effect(() => evaluate(setTarget))
    } else {
      setTarget(expression)
    }
  })

  Alpine.directive('headers', (el, { expression }, { evaluateLater, effect }) => {
    let evaluate = evaluateLater(expression || '{}')
    effect(() => {
      evaluate(headers => {
        el.__ajax_headers = headers
      })
    })
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge')}]`)
  Alpine.directive('merge', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setMerge = (strategy) => {
      el.__ajax_merge = {
        strategy: strategy || settings.mergeStrategy,
        transition: settings.transitions || modifiers.includes('transition')
      }
    }

    if (value === 'dynamic') {
      let evaluate = evaluateLater(expression)
      effect(() => evaluate(setMerge))
    } else {
      setMerge(expression)
    }
  })

  Alpine.magic('ajax', (el) => {
    return async (action, options = {}) => {
      if (!dispatch(el, 'ajax:before')) {
        return
      }

      let control = {
        el,
        target: {
          'xxx': {
            ids: parseIds(el, options.targets || options.target),
            sync: Boolean(options.sync),
            history: ('history' in options) ? options.history : false,
            focus: ('focus' in options) ? options.focus : true,
          },
        },
        headers: options.headers || {}
      }
      let method = options.method ? options.method.toUpperCase() : 'GET'
      let body = options.body

      return send(control, action, method, body)
    }
  })

  Alpine.ajax = {
    listeners: [],
    start() {
      if (!this.listeners.length) {
        this.listeners.push(addGlobalListener('submit', handleForms))
        this.listeners.push(addGlobalListener('click', handleLinks))
      }
    },
    stop() {
      this.listeners.forEach(ignore => ignore())
      this.listeners = []
    },
  }

  Alpine.ajax.start()
}

Ajax.configure = (options) => {
  settings = Object.assign(settings, options)

  return Ajax
}

export default Ajax

async function handleLinks(event) {
  if (event.defaultPrevented ||
    event.which > 1 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) return

  let link = event?.target.closest('a[href]:not([download]):not([noajax])')

  if (!link ||
    !link.__ajax_target ||
    link.isContentEditable ||
    link.origin !== window.location.origin ||
    link.getAttribute('href').startsWith('#') ||
    (sameUrl(link, window.location) && link.hash)
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  if (!dispatch(link, 'ajax:before')) {
    return
  }

  let control = {
    el: link,
    target: link.__ajax_target,
    headers: link.__ajax_headers || {},
  }
  let action = link.getAttribute('href')

  try {
    return await send(control, action)
  } catch (error) {
    if (error.name === 'RenderError') {
      console.warn(error.message)
      window.location.href = link.href
      return
    }

    throw error
  }
}

async function handleForms(event) {
  if (event.defaultPrevented) {
    return
  }

  let form = event.target
  let submitter = event.submitter
  let method = (submitter?.getAttribute('formmethod') || form.getAttribute('method') || 'GET').toUpperCase()

  if (!form ||
    !form.__ajax_target ||
    method === 'DIALOG' ||
    submitter?.hasAttribute('formnoajax') ||
    submitter?.hasAttribute('formtarget') ||
    form.hasAttribute('noajax') ||
    form.hasAttribute('target')
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  if (!dispatch(form, 'ajax:before')) {
    return
  }

  let control = {
    el: form,
    target: form.__ajax_target,
    headers: form.__ajax_headers || {},
  }
  let body = new FormData(form)
  let enctype = form.getAttribute('enctype')
  let action = form.getAttribute('action')
  if (submitter) {
    enctype = submitter.getAttribute('formenctype') || enctype
    action = submitter.getAttribute('formaction') || action
    if (submitter.name) {
      body.append(submitter.name, submitter.value)
    }
  }

  try {
    return await withSubmitter(submitter, () => {
      return send(control, action, method, body, enctype)
    })
  } catch (error) {
    if (error.name === 'RenderError') {
      console.warn(error.message)
      form.setAttribute('noajax', 'true')
      form.requestSubmit(submitter)

      return
    }

    throw error
  }
}

function addGlobalListener(name, callback) {
  let callbackWithErrorHandler = async (event) => {
    await callback(event)
  }

  // Late bind listeners so they're last in the event chain
  let onCapture = () => {
    document.removeEventListener(name, callbackWithErrorHandler, false)
    document.addEventListener(name, callbackWithErrorHandler, false)
  }

  document.addEventListener(name, onCapture, true)

  return () => document.removeEventListener(name, onCapture, true)
}

async function withSubmitter(submitter, callback) {
  if (!submitter) return await callback()

  let disableEvent = e => e.preventDefault()

  submitter.setAttribute('aria-disabled', 'true')
  submitter.addEventListener('click', disableEvent)

  let result
  try {
    result = await callback()
  } finally {
    submitter.removeAttribute('aria-disabled')
    submitter.removeEventListener('click', disableEvent)
  }

  return result
}

let PlanQueue = new Map
let RequestQueue = new Map
let ResponseCache = new Map

async function send(control, action = '', method = 'GET', body = null, enctype = 'application/x-www-form-urlencoded') {
  let plan = control.target.xxx
  let targets = createTargets(plan)
  let ids = []
  let queued = false
  targets.forEach(target => {
    ids.push(target.id)
    if (target.sync) {
      return
    }
    PlanQueue.forEach((plan, key) => {
      if (plan.ids.includes(target.id)) {
        RequestQueue.set(key, () => send(control, action, method, body, enctype))
        queued = true
      }
    })
  })

  if (queued) {
    return
  }

  PlanQueue.set(control, plan)
  let referrer = control.el.closest('[data-source]')?.dataset.source || window.location.href
  let request = {
    action: action || referrer,
    method,
    body: body ? parseFormData(body) : null,
    enctype,
    referrer,
    headers: Object.assign({
      'X-Alpine-Request': true,
      'X-Alpine-Target': ids.join(' '),
    }, settings.headers, control.headers),
  }

  dispatch(control.el, 'ajax:send', request)

  if (request.body) {
    if (request.method === 'GET') {
      request.action = mergeBodyIntoAction(request.body, request.action)
      request.body = null
    } else if (request.enctype !== 'multipart/form-data') {
      request.body = formDataToParams(request.body)
    }
  }

  let pending
  if (method === 'GET' && ResponseCache.has(request.action)) {
    pending = ResponseCache.get(request.action)
  } else {
    pending = fetch(request.action, request).then(async (response) => {
      let text = await response.text()
      let wrapper = document.createRange().createContextualFragment('<template>' + text + '</template>')
      response.html = wrapper.firstElementChild.content

      return response
    })

    ResponseCache.set(request.action, pending)
  }

  let response = await pending

  if (response.ok) {
    if (response.redirected) {
      dispatch(control.el, 'ajax:redirect', response)
      ResponseCache.set(response.url, pending)
      setTimeout(() => { ResponseCache.delete(response.url) }, 5)
    }
    dispatch(control.el, 'ajax:success', response)
  } else {
    dispatch(control.el, 'ajax:error', response)
  }

  dispatch(control.el, 'ajax:sent', response)

  if (!response.html) {
    targets.forEach(target => target.release())
    flushQueues(control)

    return
  }

  let status = response.redirected ? '3xx' : response.status.toString()
  let key = [
    status,
    status.charAt(0) + 'xx',
    !response.ok ? 'error' : 'xxx',
    'xxx',
  ].find(key => key in control.target)
  plan = control.target[key]
  if (!plan.ids.includes('_self') || !response.redirected || !sameUrl(new URL(response.url), window.location)) {
    targets.forEach(target => target.release())
    targets = createTargets(plan)
  }

  if (plan.history) {
    updateHistory(plan.history, response.url)
  }

  let focused = !plan.focus
  let renders = targets.map(async target => {
    if (target.el === document.documentElement) {
      window.location.href = response.url
    }

    if (!document.body.contains(target.el)) {
      return
    }

    let content = response.html.getElementById(target.id)
    if (!content) {
      if (target.sync) {
        return
      }

      if (!dispatch(control.el, 'ajax:missing', { target: target.el, response })) {
        return
      }

      if (response.ok) {
        return target.el.remove()
      }

      throw new RenderError(target.el, response.status)
    }

    let mergeContent = async () => {
      target = await merge(target, content)
      if (target.el) {
        target.el.dataset.source = response.url
        target.release()
        let selectors = ['[x-autofocus]', '[autofocus]']
        while (!focused && selectors.length) {
          let selector = selectors.shift()
          if (target.el.matches(selector)) {
            focused = focusOn(target.el)
          }
          focused = focused || Array.from(target.el.querySelectorAll(selector)).some(focusable => focusOn(focusable))
        }
      }

      dispatch(target.el, 'ajax:merged')

      return target.el
    }

    if (!dispatch(target.el, 'ajax:merge', { strategy: target.strategy, content, merge: mergeContent })) {
      return
    }

    return mergeContent()
  })

  ResponseCache.delete(action)

  let render = await Promise.all(renders)

  dispatch(control.el, 'ajax:after', { response, render })

  flushQueues(control)

  return render
}

function parseFormData(data) {
  if (data instanceof FormData) return data
  if (data instanceof HTMLFormElement) return new FormData(data)

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

function mergeBodyIntoAction(body, action) {
  action = new URL(action, document.baseURI)
  action.search = formDataToParams(body).toString()

  return action.toString()
}

function formDataToParams(body) {
  let params = Array.from(body.entries()).filter(([key, value]) => {
    return !(value instanceof File)
  })

  return new URLSearchParams(params)
}

function flushQueues(control) {
  PlanQueue.delete(control)
  if (RequestQueue.has(control)) {
    RequestQueue.get(control)()
    RequestQueue.delete(control)
  }
}

async function merge(target, to) {
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
      doMorph(from, to)

      return document.getElementById(to.getAttribute('id'))
    }
  }

  if (target.transition) {
    let transition = document.startViewTransition(() => {
      target.el = strategies[target.strategy](target.el, to)
    })
    await transition.ready
  } else {
    target.el = strategies[target.strategy](target.el, to)
  }

  return target
}

function focusOn(el) {
  if (!el) return false
  if (!el.getClientRects().length) return false
  setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.focus()
  }, 0)

  return true
}

function updateHistory(strategy, url) {
  let strategies = {
    push: () => window.history.pushState({ __ajax: true }, '', url),
    replace: () => window.history.replaceState({ __ajax: true }, '', url),
  }

  return strategies[strategy]();
}

function parseIds(el, ids = null) {
  let parsed = [el.getAttribute('id')]
  if (ids) {
    parsed = Array.isArray(ids) ? ids : ids.split(' ')
  }
  parsed = parsed.filter(id => id)

  if (parsed.length === 0) {
    throw new IDError(el)
  }

  return parsed
}

function createTargets(plan) {
  let targets = plan.ids.map(id => {
    let el = ['_self', '_top'].includes(id) ? document.documentElement : document.getElementById(id)
    if (!el) {
      console.warn(`Target [#${id}] was not found in current document.`)
      return
    }

    return target(id, el)
  }).filter(target => target)

  if (plan.sync) {
    document.querySelectorAll('[x-sync]').forEach(el => {
      let id = el.getAttribute('id')
      if (!id) {
        throw new IDError(el)
      }

      let t = target(id, el)
      t.sync = true

      targets.push(t)
    })
  }

  return targets
}

function target(id, el) {
  let release = () => { }
  if (el.getAttribute('aria-busy') !== 'true') {
    el.setAttribute('aria-busy', true)
    release = () => el.removeAttribute('aria-busy')
  }

  return {
    id,
    el,
    strategy: el.__ajax_merge?.strategy || settings.mergeStrategy,
    transition: el.__ajax_merge?.transition && document.startViewTransition,
    release
  }
}

function dispatch(el, name, detail) {
  return el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  )
}

function sameUrl(urlA, urlB) {
  return (stripTrailingSlash(urlA.pathname) + urlA.search) === (stripTrailingSlash(urlB.pathname) + urlB.search)
}

function stripTrailingSlash(str) {
  return str.replace(/\/$/, "")
}

class IDError extends DOMException {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`, 'IDError')
  }
}

class RenderError extends DOMException {
  constructor(target, status) {
    let id = target.getAttribute('id')
    super(`Target [#${id}] was not found in response with status [${status}].`, 'RenderError')
  }
}

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

  Alpine.directive('target', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setTargets = (ids) => {
      let statues = modifiers.filter((modifier) => modifier === 'error' || parseInt(modifier))
      statues = statues.length ? statues : ['xxx']
      statues.forEach(status => {
        // Redirect status codes are opaque to fetch
        // so we just use the first 3xx status given.
        if (status.charAt(0) === '3') {
          status = '3xx'
        }
        AjaxAttributes.set(el, {
          [status]: {
            ids: parseIds(el, ids),
            focus: !modifiers.includes('nofocus'),
            history: modifiers.includes('push') ? 'push' : (modifiers.includes('replace') ? 'replace' : false),
          }
        })
      })
    }

    if (value === 'dynamic') {
      let evaluate = evaluateLater(expression)
      effect(() => evaluate(setTargets))
    } else {
      setTargets(expression)
    }
  })

  Alpine.directive('headers', (el, { expression }, { evaluateLater, effect }) => {
    let evaluate = evaluateLater(expression || '{}')
    effect(() => {
      evaluate(headers => {
        AjaxAttributes.set(el, { headers })
      })
    })
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge')}]`)
  Alpine.directive('merge', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setMerge = (strategy) => {
      AjaxAttributes.set(el, {
        strategy: strategy || settings.mergeStrategy,
        transition: settings.transitions || modifiers.includes('transition')
      })
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
      let targets = findTargets(parseIds(el, options.targets || options.target))
      targets = options.sync ? addSyncTargets(targets) : targets
      let referrer = source(el)
      let headers = Object.assign({}, settings.headers, options.headers || {})
      let method = options.method ? options.method.toUpperCase() : 'GET'
      let body = options.body

      let response = await request(el, targets, action, referrer, headers, method, body)

      let history = ('history' in options) ? options.history : false
      let focus = ('focus' in options) ? options.focus : true

      return render(response, el, targets, history, focus)
    }
  })

  let listeners = []

  Alpine.ajax = {
    start() {
      if (!listeners.length) {
        listeners.push(addGlobalListener('submit', handleForms))
        listeners.push(addGlobalListener('click', handleLinks))
      }
    },
    stop() {
      listeners.forEach(ignore => ignore())
      listeners = []
    },
  }

  Alpine.ajax.start()
}

Ajax.configure = (options) => {
  settings = Object.assign(settings, options)

  return Ajax
}

export default Ajax

let AjaxAttributes = {
  store: new WeakMap,
  set(el, config) {
    if (this.store.has(el)) {
      this.store.set(el, Object.assign(this.store.get(el), config))
    } else {
      this.store.set(el, config)
    }
  },
  get(el) {
    return this.store.get(el) || {}
  },
  has(el) {
    return this.store.has(el)
  }
}

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
    !AjaxAttributes.has(link) ||
    link.isContentEditable ||
    link.getAttribute('href').startsWith('#') ||
    link.origin !== location.origin ||
    ((link.pathname + link.search) === (location.pathname + location.search) && link.hash)
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  let attributes = AjaxAttributes.get(link)
  let config = attributes.xxx || {}
  let targets = addSyncTargets(findTargets(config.ids))
  let referrer = source(link)
  let action = link.getAttribute('href') || referrer
  let headers = attributes.headers || {}

  let response = await request(link, targets, action, referrer, headers)

  let key = statusKey(attributes, response)
  if (key) {
    config = attributes[key]
    targets = addSyncTargets(findTargets(config.ids))
  }
  let history = config.history
  let focus = config.focus ?? true

  try {
    return await render(response, link, targets, history, focus)
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
    !AjaxAttributes.has(form) ||
    method === 'DIALOG' ||
    submitter?.hasAttribute('formnoajax') ||
    submitter?.hasAttribute('formtarget') ||
    form.hasAttribute('noajax') ||
    form.hasAttribute('target')
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  let attributes = AjaxAttributes.get(form)
  let config = attributes.xxx || {}
  let targets = addSyncTargets(findTargets(config.ids))
  let referrer = source(form)
  let action = form.getAttribute('action') || referrer
  let headers = attributes.headers || {}
  let body = new FormData(form)
  let enctype = form.getAttribute('enctype')
  if (submitter) {
    enctype = submitter.getAttribute('formenctype') || enctype
    action = submitter.getAttribute('formaction') || action
    if (submitter.name) {
      body.append(submitter.name, submitter.value)
    }
  }

  let response = await withSubmitter(submitter, () => {
    return request(form, targets, action, referrer, headers, method, body, enctype)
  })

  let key = statusKey(attributes, response)
  if (key) {
    config = attributes[key]
    targets = addSyncTargets(findTargets(config.ids))
  }
  let history = config.history
  let focus = config.focus ?? true

  try {
    return await render(response, form, targets, history, focus)
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
    try {
      await callback(event)
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }

      throw error
    }
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

  let result = await callback()

  submitter.removeAttribute('aria-disabled')
  submitter.removeEventListener('click', disableEvent)

  return result
}

let PendingTargets = {
  store: new Map,
  abort(id) {
    if (this.store.has(id)) {
      let request = this.store.get(id)
      request.controller.abort()
      request.target.removeAttribute('aria-busy')
    }
  },
  set(id, target, controller) {
    this.abort(id)
    target.querySelectorAll('[aria-busy]').forEach((busy) => this.abort(busy.getAttribute('id')))
    this.store.set(id, { target, controller })
    target.setAttribute('aria-busy', 'true')
  },
}

let PendingRequests = new Map

async function request(el, targets, action, referrer, headers, method = 'GET', body = null, enctype = 'application/x-www-form-urlencoded') {
  if (!dispatch(el, 'ajax:before')) {
    throw new DOMException('[ajax:before] aborted', 'AbortError')
  }

  let controller = new AbortController()
  let targetIds = []
  targets.forEach(target => {
    let id = target.getAttribute('id')
    PendingTargets.set(id, target, controller)
    targetIds.push(id)
  })

  let pending
  if (method === 'GET' && PendingRequests.has(action)) {
    pending = PendingRequests.get(action)
  } else {
    headers['X-Alpine-Target'] = targetIds.join('  ')
    headers['X-Alpine-Request'] = 'true'
    headers = Object.assign({}, settings.headers, headers)
    body = body ? parseFormData(body) : null

    let options = {
      action,
      method,
      headers,
      body,
      referrer,
      enctype,
      signal: controller.signal,
    }

    dispatch(el, 'ajax:send', options)

    if (options.body) {
      if (options.method === 'GET') {
        options.action = mergeBodyIntoAction(options.body, options.action)
        options.body = null
      } else if (options.enctype !== 'multipart/form-data') {
        options.body = formDataToParams(options.body)
      }
    }

    pending = fetch(options.action, options).then(async (response) => {
      response.html = await response.text()

      return response
    })

    PendingRequests.set(action, pending)
  }

  let response = await pending

  PendingRequests.delete(action)

  if (response.ok) {
    response.redirected && dispatch(el, 'ajax:redirect', response)
    dispatch(el, 'ajax:success', response)
  } else {
    dispatch(el, 'ajax:error', response)
  }

  dispatch(el, 'ajax:sent', response)

  return response
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

async function render(response, el, targets, history, focus) {
  if (!response.html) {
    targets.forEach(target => target.removeAttribute('aria-busy'))

    return
  }

  if (history) {
    updateHistory(history, response.url)
  }

  let wrapper = document.createRange().createContextualFragment('<template>' + response.html + '</template>')
  let fragment = wrapper.firstElementChild.content
  let focused = !focus
  let renders = targets.map(async target => {
    if (target === document) {
      window.location.href = response.url
      return
    }
    let id = target.getAttribute('id')
    let content = fragment.getElementById(id)
    let strategy = AjaxAttributes.get(target)?.strategy ?? settings.mergeStrategy
    if (!content) {
      if (target.matches('[x-sync]')) {
        return
      }

      if (!dispatch(el, 'ajax:missing', { target, response })) {
        return
      }

      if (response.ok) {
        return target.remove()
      }

      throw new RenderError(target, response.status)
    }

    let mergeContent = async () => {
      let merged = await merge(strategy, target, content)

      if (merged) {
        merged.dataset.source = response.url
        merged.removeAttribute('aria-busy')
        let focusables = ['[x-autofocus]', '[autofocus]']
        focusables.some(selector => {
          if (focused) return true
          if (merged.matches(selector)) {
            focused = focusOn(merged)
          }

          return focused || Array.from(merged.querySelectorAll(selector)).some(focusable => focusOn(focusable))
        })
      }

      dispatch(merged, 'ajax:merged')

      return merged
    }

    if (!dispatch(target, 'ajax:merge', { strategy, content, merge: mergeContent })) {
      return
    }

    return mergeContent()
  })

  let render = await Promise.all(renders)

  dispatch(el, 'ajax:after', {
    response,
    render,
  })

  return render
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
      doMorph(from, to)

      return document.getElementById(to.getAttribute('id'))
    }
  }

  if (!AjaxAttributes.get(from)?.transition || !document.startViewTransition) {
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

function findTargets(ids = []) {
  return ids.map(id => {
    let target = id === '_self' ? document : document.getElementById(id)
    if (!target) {
      throw new TargetError(id)
    }

    return target
  })
}

function addSyncTargets(targets) {
  document.querySelectorAll('[x-sync]').forEach(el => {
    let id = el.getAttribute('id')
    if (!id) {
      throw new IdNotFoundError(el)
    }

    if (!targets.some(target => target.getAttribute('id') === id)) {
      targets.push(el)
    }
  })

  return targets
}

function statusKey(attributes, response) {
  let status = response.redirected ? '3xx' : response.status.toString()

  return [
    status,
    status.charAt(0) + 'xx',
    !response.ok ? 'error' : '',
  ].find(key => key in attributes)
}

function source(el) {
  return el.closest('[data-source]')?.dataset.source || window.location.href
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

class IDError extends DOMException {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`, 'IDError')
  }
}

class TargetError extends DOMException {
  constructor(id) {
    super(`Target [#${id}] was not found in current document.`, 'TargetError')
  }
}

class RenderError extends DOMException {
  constructor(target, status) {
    let id = target.getAttribute('id')
    super(`Target [#${id}] was not found in response with status [${status}].`, 'RenderError')
  }
}

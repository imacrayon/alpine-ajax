let settings = {
  headers: {},
  mergeStrategy: 'replace',
  transitions: false,
  mapDelimiter: ':',
}

let doMorph = () => {
  console.error(`You can't use the "morph" merge without first installing the Alpine "morph" plugin here: https://alpinejs.dev/plugins/morph`)
}

function Ajax(Alpine) {
  if (Alpine.morph) doMorph = Alpine.morph

  Alpine.addInitSelector(() => `[${Alpine.prefixed('target')}]`)
  Alpine.addInitSelector(() => `[${Alpine.prefixed('target\\.push')}]`)
  Alpine.addInitSelector(() => `[${Alpine.prefixed('target\\.replace')}]`)
  Alpine.directive('target', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setTarget = (ids) => {
      el._ajax_target = el._ajax_target || {}
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

        el._ajax_target[status] = plan
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
        el._ajax_headers = headers
      })
    })
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge')}]`)
  Alpine.directive('merge', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setMerge = (strategy) => {
      el._ajax_strategy = strategy
      el._ajax_transition = settings.transitions || modifiers.includes('transition')
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

  let started = false
  Alpine.ajax = {
    start() {
      if (!started) {
        document.addEventListener('submit', handleForms)
        document.addEventListener('click', handleLinks)
        window.addEventListener('popstate', handleHistory)
        started = true
      }
    },
    stop() {
      document.removeEventListener('submit', handleForms)
      document.removeEventListener('click', handleLinks)
      window.removeEventListener('popstate', handleHistory)
      started = false
    },
  }
  Alpine.ajax.start()
}

Ajax.configure = (options) => {
  settings = Object.assign(settings, options)

  return Ajax
}

export default Ajax

function handleHistory(event) {
  if (!event.state || !event.state.__ajax) return

  window.location.reload(true)
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
    !link._ajax_target ||
    link.isContentEditable ||
    link.origin !== window.location.origin ||
    link.getAttribute('href').startsWith('#') ||
    (sameUrl(link, window.location) && link.hash)
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  let control = {
    el: link,
    target: link._ajax_target,
    headers: link._ajax_headers || {},
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
    !form._ajax_target ||
    method === 'DIALOG' ||
    submitter?.hasAttribute('formnoajax') ||
    submitter?.hasAttribute('formtarget') ||
    form.hasAttribute('noajax') ||
    form.hasAttribute('target')
  ) return

  event.preventDefault()
  event.stopImmediatePropagation()

  let control = {
    el: form,
    target: form._ajax_target,
    headers: form._ajax_headers || {},
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

let ResponseCache = new Map

async function send(control, action = '', method = 'GET', body = null, enctype = 'application/x-www-form-urlencoded') {
  if (!dispatch(control.el, 'ajax:before')) {
    return
  }

  let plan = control.target.xxx
  let controller = new AbortController()
  let targets = createTargets(plan, controller)
  let referrer = control.el.closest('[data-source]')?.dataset.source || window.location.href
  let request = {
    action: action || referrer,
    method,
    body: body ? parseFormData(body) : null,
    enctype,
    referrer,
    signal: controller.signal,
    headers: Object.assign({
      'X-Alpine-Request': true,
      'X-Alpine-Target': targets.map(target => target._ajax_id).join(' '),
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

  let response
  try {
    response = await pending
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error
    }

    return
  }

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
    targets.forEach(target => target._ajax_abort())

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
  if (!plan.ids.flat().includes('_self') || !response.redirected || !sameUrl(new URL(response.url), window.location)) {
    targets.forEach(target => target._ajax_abort())
    targets = createTargets(plan, controller)
  }

  if (plan.history) {
    updateHistory(plan.history, response.url)
  }

  let focused = !plan.focus
  let renders = targets.map(async target => {
    if (target === document.documentElement) {
      window.location.href = response.url
    }

    if (!document.body.contains(target)) {
      return
    }

    let content = response.html.getElementById(target._ajax_id)
    if (!content) {
      if (target._ajax_sync) {
        return
      }

      if (!dispatch(control.el, 'ajax:missing', { target, response })) {
        return
      }

      if (response.ok) {
        return target.remove()
      }

      throw new RenderError(target, response.status)
    }

    let mergeContent = async () => {
      target = await merge(target, content)
      if (target) {
        target.dataset.source = response.url
        target._ajax_abort && target._ajax_abort()
        let selectors = ['[x-autofocus]', '[autofocus]']
        while (!focused && selectors.length) {
          let selector = selectors.shift()
          if (target.matches(selector)) {
            focused = focusOn(target)
          }
          focused = focused || Array.from(target.querySelectorAll(selector)).some(focusable => focusOn(focusable))
        }
      }

      dispatch(target, 'ajax:merged')

      return target
    }

    if (!dispatch(target, 'ajax:merge', { strategy: target._ajax_strategy, content, merge: mergeContent })) {
      return
    }

    return mergeContent()
  })

  ResponseCache.delete(request.action)

  let render = await Promise.all(renders)

  dispatch(control.el, 'ajax:after', { response, render })

  return render
}

function createTargets(plan, controller) {
  let decorate = (el) => {
    el._ajax_strategy = el._ajax_strategy || settings.mergeStrategy
    el._ajax_transition = el.__ajax_transition && document.startViewTransition
    el._ajax_abort && el._ajax_abort()
    el.querySelectorAll('[aria-busy]').forEach((busy) => {
      busy._ajax_abort && busy._ajax_abort()
    })
    el.setAttribute('aria-busy', 'true')
    el._ajax_abort = () => {
      el.removeAttribute('aria-busy')
      controller.abort()
    }

    return el
  }

  let targets = plan.ids.map(pair => {
    let docId = pair[0]
    let el = ['_self', '_top'].includes(docId) ? document.documentElement : document.getElementById(docId)
    if (!el) {
      console.warn(`Target [#${docId}] was not found in current document.`)
      return
    }

    let target = decorate(el)
    target._ajax_id = pair[1]

    return target
  }).filter(target => target)

  if (plan.sync) {
    document.querySelectorAll('[x-sync]').forEach(el => {
      let id = el.getAttribute('id')
      if (!id) {
        throw new IDError(el)
      }

      let target = decorate(el)
      target._ajax_id = id
      target._ajax_sync = true
      targets.push(target)
    })
  }

  return targets
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

  if (!target._ajax_transition) {
    return strategies[target._ajax_strategy](target, to)
  }

  let transition = document.startViewTransition(() => {
    target = strategies[target._ajax_strategy](target, to)
  })
  await transition.ready

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
  let elId = el.getAttribute('id')
  let parsed = [elId]
  if (ids) {
    parsed = Array.isArray(ids) ? ids : ids.split(' ')
  }
  parsed = parsed.filter(id => id).map(id => {
    let pair = id.split(settings.mapDelimiter).map(id => id || elId)
    pair[1] = pair[1] || pair[0]
    return pair
  })
  if (parsed.length === 0) {
    throw new IDError(el)
  }

  return parsed
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

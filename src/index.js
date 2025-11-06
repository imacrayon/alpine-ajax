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

      let statues = modifiers.filter((modifier) => ['back', 'away', 'error'].includes(modifier) || parseInt(modifier))
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
  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge\\.transition')}]`)
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
    configure: Ajax.configure,
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
    (link.hash && samePath(link, new URL(document.baseURI)))
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

let PendingTargets = {
  store: new Map,
  plan(plan, response) {
    plan.ids.forEach(pair => {
      let docId = pair[0]
      let el = ['_self', '_top', '_none'].includes(docId) ? document.documentElement : document.getElementById(docId)
      if (!el) {
        return console.warn(`Target [#${docId}] was not found in current document.`)
      }

      el._ajax_id = pair[1]
      this.set(el, response)
    })

    if (plan.sync) {
      let targeted = plan.ids.flat()
      document.querySelectorAll('[x-sync]').forEach(el => {
        let id = el.getAttribute('id')
        if (!id) {
          throw new IDError(el)
        }

        if (targeted.includes(id)) {
          return
        }

        el._ajax_id = id
        el._ajax_sync = true
        this.set(el, response)
      })
    }
  },
  purge(response) {
    this.store.forEach((r, t) => response === r && this.delete(t))
  },
  get(response) {
    let targets = []
    this.store.forEach((r, t) => response === r && targets.push(t))

    return targets
  },
  set(target, response) {
    target.querySelectorAll('[aria-busy]').forEach((busy) => {
      this.delete(busy)
    })
    target.setAttribute('aria-busy', 'true')
    this.store.set(target, response)
  },
  delete(target) {
    target.removeAttribute('aria-busy')
    this.store.delete(target)
  },
}


let RequestCache = new Map

async function send(control, action = '', method = 'GET', body = null, enctype = 'application/x-www-form-urlencoded') {
  if (!dispatch(control.el, 'ajax:before')) {
    return
  }

  let plan = control.target.xxx
  let response = { ok: false, redirected: false, url: '', status: '', html: '', raw: '' }
  PendingTargets.plan(plan, response)
  let referrer = new URL(control.el.closest('[data-source]')?.dataset.source || '', document.baseURI)
  action = new URL(action || referrer, document.baseURI)
  if (body) {
    body = parseFormData(body)
    if (method === 'GET') {
      action.search = formDataToParams(body).toString()
      body = null
    } else if (enctype !== 'multipart/form-data' && (body instanceof FormData)) {
      body = formDataToParams(body)
    } else {
      enctype = null
    }
  }

  let request = {
    action: action.toString(),
    method,
    body,
    enctype,
    referrer: referrer.toString(),
    headers: Object.assign({
      'X-Alpine-Request': true,
      'X-Alpine-Target': PendingTargets.get(response).map(target => target._ajax_id).join(' '),
    }, settings.headers, control.headers),
  }

  if (!request.enctype) { delete request.enctype } // Let browser set the correct multipart boundary
  
  dispatch(control.el, 'ajax:send', request)

  let pending
  if (request.method === 'GET' && RequestCache.has(request.action)) {
    pending = RequestCache.get(request.action)
  } else {
    pending = fetch(request.action, request).then(async (r) => {
      let text = await r.text()
      let wrapper = document.createRange().createContextualFragment('<template>' + text + '</template>')
      r.html = wrapper.firstElementChild.content
      r.raw = text

      return r
    })
    RequestCache.set(request.action, pending)
  }

  await pending.then((r) => {
    response.ok = r.ok
    response.redirected = r.redirected
    response.url = r.url
    response.status = r.status
    response.html = r.html
    response.raw = r.raw
  })

  if (response.ok) {
    if (response.redirected) {
      dispatch(control.el, 'ajax:redirect', response)
      RequestCache.set(response.url, pending)
      setTimeout(() => { RequestCache.delete(response.url) }, 5)
    }
    dispatch(control.el, 'ajax:success', response)
  } else {
    dispatch(control.el, 'ajax:error', response)
  }

  dispatch(control.el, 'ajax:sent', response)
  RequestCache.delete(request.action)

  if (!response.html) {
    PendingTargets.purge(response)

    return
  }

  let status = response.redirected ? '3xx' : response.status.toString()
  let isBack = samePath(new URL(response.url), new URL(request.referrer, document.baseURI))
  let key = [
    response.redirected ? (isBack ? 'back' : 'away') : null,
    status,
    status.charAt(0) + 'xx',
    response.ok ? 'xxx' : 'error',
    'xxx',
  ].find(key => key in control.target)
  if (key !== 'xxx') {
    plan = control.target[key]
    if (!response.redirected || !isBack || !plan.ids.flat().includes('_self')) {
      PendingTargets.purge(response)
      PendingTargets.plan(plan, response)
    }
  }

  if (plan.history) {
    updateHistory(plan.history, response.url)
  }

  let focused = !plan.focus
  let renders = PendingTargets.get(response).map(async target => {

    if (!target.isConnected || target._ajax_id === '_none') {
      PendingTargets.delete(target)
      return
    }

    if (target === document.documentElement) {
      window.location.href = response.url
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

    let strategy = target._ajax_strategy || settings.mergeStrategy
    let render = async () => {
      target = await merge(strategy, target, content)
      if (target) {
        target.dataset.source = response.url
        PendingTargets.delete(target)
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

    if (!dispatch(target, 'ajax:merge', { strategy, content, merge: render })) {
      return
    }

    return render()
  })

  let render = await Promise.all(renders)

  dispatch(control.el, 'ajax:after', { response, render })

  return render
}

function parseFormData(data) {
  if (data instanceof FormData) return data
  if (data instanceof HTMLFormElement) return new FormData(data)
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return data
  if (data instanceof DataView) return data
  if (data instanceof Blob) return data
  if (data instanceof File) return data
  if (data instanceof URLSearchParams) return data
  if (data instanceof ReadableStream) return data

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

function formDataToParams(body) {
  let params = Array.from(body.entries()).filter(([key, value]) => {
    return !(value instanceof File)
  })

  return new URLSearchParams(params)
}

async function merge(strategy, target, to) {
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

  if (!target._ajax_transition || !document.startViewTransition) {
    return strategies[strategy](target, to)
  }

  let transition = document.startViewTransition(() => {
    target = strategies[strategy](target, to)
    return Promise.resolve()
  })
  await transition.updateCallbackDone

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

function samePath(urlA, urlB) {
  return stripTrailingSlash(urlA.pathname) === stripTrailingSlash(urlB.pathname)
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

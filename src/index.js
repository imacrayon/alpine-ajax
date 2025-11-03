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
  Alpine.addInitSelector(() => `[${Alpine.prefixed('target\\.replace')}]`)
  Alpine.directive('target', (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setTarget = (ids) => {
      ids = (ids ? ids.split(' ') : [el.getAttribute('id')]).filter(Boolean)
      let statuses = modifiers.filter(m => /^(back|away|error|\d+)$/.test(m)).map(
        m => m.startsWith('3') ? '3xx' : m // Redirect status codes are opaque to fetch
      )
      if (statuses.length) {
        el._ajax_status = Object.assign({}, el._ajax_status, Object.fromEntries(statuses.map(status => [status, ids])))
      } else {
        el._ajax_target = {
          ids,
          sync: true,
          focus: !modifiers.includes('nofocus'),
          history: modifiers.includes('replace') || false,
        }
      }
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
    return async (action, { targets, target, ...options } = {}) => send({
      el, action, ...options,
      ids: (targets || target?.split(' ') || [el.getAttribute('id')]).filter(Boolean),
    })
  })

  let started = false
  Alpine.ajax = {
    configure: Ajax.configure,
    merge,
    send,
    start() {
      if (!started) {
        document.addEventListener('submit', handleForms)
        document.addEventListener('click', handleLinks)
        started = true
      }
    },
    stop() {
      document.removeEventListener('submit', handleForms)
      document.removeEventListener('click', handleLinks)
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

  return send({
    ...link._ajax_target,
    el: link,
    headers: link._ajax_headers || {},
    action: link.getAttribute('href'),
  }).catch(error => {
    if (error.name !== 'RenderError') throw error
    console.warn(error.message)
    window.location.href = link.href
  })
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

  let body = new FormData(form)
  if (submitter?.name) body.append(submitter.name, submitter.value)

  return withSubmitter(submitter, () => send({
    ...form._ajax_target,
    body,
    method,
    el: form,
    headers: form._ajax_headers || {},
    action: submitter?.getAttribute('formaction') || form.getAttribute('action'),
    enctype: submitter?.getAttribute('formenctype') || form.getAttribute('enctype'),
  })).catch(error => {
    if (error.name !== 'RenderError') throw error
    console.warn(error.message)
    form.setAttribute('noajax', 'true')
    form.requestSubmit(submitter)
  })
}

function withSubmitter(submitter, callback) {
  if (!submitter) return callback()

  let disableEvent = e => e.preventDefault()

  submitter.setAttribute('aria-disabled', 'true')
  submitter.addEventListener('click', disableEvent)

  return callback().finally(() => {
    submitter.removeAttribute('aria-disabled')
    submitter.removeEventListener('click', disableEvent)
  })
}

let PendingTargets = {
  store: new Map,
  get(request) {
    let targets = []
    this.store.forEach((r, t) => request === r && targets.push(t))

    return targets
  },
  set(request, ids = [], sync = true) {
    this.purge(request)

    if (ids.length === 0) throw new IDError(request.el)

    let activate = (target, id) => {
      target.setAttribute('aria-busy', 'true')
      if (id) target._ajax_id = id

      return this.store.set(target, request)
    }

    ids.forEach(token => {
      let tokens = Array.isArray(token) ? token : token.split(settings.mapDelimiter)
      let [id, alias] = tokens.map(t => t || request.el.getAttribute('id'))
      alias = alias || id
      let special = { '_none': request.el, '_top': document.documentElement }
      if (special[id]) return activate(special[id])

      let target = document.getElementById(id)
      if (!target) return console.warn(`Target [#${id}] was not found in current document.`)
      if (!target.getAttribute('id')) throw new IDError(target)
      target.querySelectorAll('[aria-busy]').forEach(child => this.delete(child))
      activate(target, alias)
    })

    if (sync) document.querySelectorAll('[x-sync]').forEach(target => {
      let id = target.getAttribute('id')
      if (!id) throw new IDError(target)
      target._ajax_sync = true
      activate(target, id)
    })

    return this
  },
  delete(target) {
    delete target._ajax_id
    delete target._ajax_sync
    target.removeAttribute('aria-busy')

    return this.store.delete(target)
  },
  purge(request) {
    this.store.forEach((r, t) => request === r && this.delete(t))

    return true
  }
}


let RequestCache = new Map

async function send(request) {
  if (!dispatch(request.el, 'ajax:before')) return

  PendingTargets.set(request, request.ids)

  request.method = request.method ?? 'GET'
  request.referrer = new URL(request.el.closest('[data-source]')?.dataset.source || '', document.baseURI).toString()
  request.action = new URL(request.action || request.referrer.toString(), document.baseURI).toString()
  if (/GET|DELETE/.test(request.method)) {
    let params = new URLSearchParams(request.body).toString()
    if (params) request.action += (/\?/.test(request.action) ? "&" : "?") + params
    request.body = null
  } else if (request.body instanceof FormData && !request.enctype) {
    request.body = new URLSearchParams(
      Array.from(request.body.entries()).filter(([key, value]) => !(value instanceof File))
    )
  } else if (request.body?.constructor === Object) {
    request.body = JSON.stringify(request.body)
  }
  request.headers = {
    'X-Alpine-Request': true,
    'X-Alpine-Target': PendingTargets.get(request).map(t => t._ajax_id).join(' '),
    ...settings.headers, ...(request.headers ?? {})
  }

  dispatch(request.el, 'ajax:send', { request })

  let pending = (request.method === 'GET' && RequestCache.get(request.action))
    || fetch(request.action, request).then(async response => {
      let raw = await response.text()
      let doc = document.createRange().createContextualFragment('<template>' + raw + '</template>')

      return Object.assign(response, { raw, html: doc.firstElementChild.content })
    })

  if (request.method === 'GET') RequestCache.set(request.action, pending)

  let response = await pending

  if (response.ok) {
    if (response.redirected) {
      dispatch(request.el, 'ajax:redirect', { request, response })
      RequestCache.set(response.url, pending)
      setTimeout(() => { RequestCache.delete(response.url) }, 5)
    }
    dispatch(request.el, 'ajax:success', { request, response })
  } else {
    dispatch(request.el, 'ajax:error', { request, response })
  }

  dispatch(request.el, 'ajax:sent', { request, response })
  RequestCache.delete(request.action)

  if (!response.raw) return PendingTargets.purge(request)

  if (request.el._ajax_status) {
    let status = response.redirected ? '3xx' : response.status.toString()
    let isBack = response.redirected && samePath(new URL(response.url), new URL(request.referrer, document.baseURI))
    let key = [
      status,
      isBack ? 'back' : (response.redirected ? 'away' : null),
      status[0] + 'xx',
      !response.ok && 'error',
    ].find(key => key in request.el._ajax_status)
    if (key) PendingTargets.set(request, request.el._ajax_status[key])
  }

  if (request.history) updateHistory('replace', response.url)

  let focused = !request.focus
  let render = await Promise.all(
    PendingTargets.get(request).map(async target => {
      let rendered = await renderTarget(target, response, request)
      PendingTargets.delete(target)
      if (!focused && rendered) {
        focused = (['[x-autofocus]', '[autofocus]']).some(selector => {
          if (rendered.matches(selector) && focus(rendered)) return true
          return Array.from(rendered.querySelectorAll(selector)).some(child => focus(child))
        })
      }

      return rendered
    })
  )

  dispatch(request.el, 'ajax:after', { response, render })

  return render
}

async function renderTarget(target, response, request) {
  if (target === document.documentElement) window.location.href = response.url
  if (!target.isConnected || !target._ajax_id) return

  let content = response.html.getElementById(target._ajax_id)

  if (!content) {
    if (target._ajax_sync) return
    if (!dispatch(request.el, 'ajax:missing', { target, request, response })) return
    if (response.ok) return target.remove()
    throw new RenderError(target, response.status)
  }

  let strategy = target._ajax_strategy || settings.mergeStrategy
  let detail = { content, target, strategy, request, response }

  if (!dispatch(target, 'ajax:merge', detail)) return

  let merged = await merge(target, detail.content, detail.strategy)
  if (merged) {
    merged.dataset.source = response.url
    PendingTargets.delete(merged)
    dispatch(merged, 'ajax:merged', { request, response })
  }

  return merged
}

async function merge(from, to, strategy = 'replace') {
  const run = {
    replace: () => { from.replaceWith(to); return to },
    morph: () => { doMorph(from, to); return document.getElementById(to.id) },
    update: () => { from.replaceChildren(...to.childNodes); return from },
  }[strategy] || (() => { from[strategy](...to.childNodes); return from })

  let result
  const execute = () => result = run()

  if (from._ajax_transition && document.startViewTransition) {
    await document.startViewTransition(execute).updateCallbackDone
  } else {
    execute()
  }

  return result
}

function focus(el) {
  return el?.getClientRects().length && setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.focus()
  }, 0)
}

function updateHistory(strategy, url) {
  return window.history[`${strategy}State`]({ __ajax: true }, '', url)
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
  let stripTrailingSlash = (u) => u.pathname.replace(/\/$/, '')

  return stripTrailingSlash(urlA) === stripTrailingSlash(urlB)
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

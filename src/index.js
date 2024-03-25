import './polyfills'

let settings = {
  followRedirects: true,
  headers: {},
  mergeStrategy: 'replace',
  snapshotLimit: 10,
}

let doMorph = (from, to) => {
  console.error(`You can't use the "morph" merge without first installing the Alpine "morph" plugin here: https://alpinejs.dev/plugins/morph`)
}

let MergeTargets = new WeakMap()

class AjaxClient {
  constructor(follow, headers = {}) {
    this.redirectHandler = follow
      ? (response) => response
      : (response) => {
        if (response.redirected) {
          window.location.href = response.url
          return
        }

        return response
      }

    return this

    this.headers = {}

  }
}

class AjaxElement {
  constructor(el, target = '') {
    let targets = [el.getAttribute('id')]
    if (target) {
      targets = Array.isArray(target) ? target : target.split(' ')
    }
    targets = targets.filter(id => id)
    if (targets.length === 0) {
      throw new MissingIdError(el)
    }

    this.el = el
    this.method = 'GET'
    this.targets = targets
    this.sync = true
    this.focus = true
    this.followRedirects = true
    this.enctype = 'application/x-www-form-urlencoded'
    this.history = false
    this.headers = {}
  }

  nearestSource() {
    return this.el.closest('[data-source]')?.dataset.source
  }

  dispatchEvents(dispatch) {
    this.dispatch = dispatch
      ? (name, detail) => {
        return this.el.dispatchEvent(
          new CustomEvent(name, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
          })
        )
      }
      : () => true
  }

  destruct() { }

  canNavigate() {
    return this.el.href &&
      !this.el.hash &&
      this.el.origin == window.url.origin
  }

  canSubmit() {
    return this.el.tagName === 'FORM'
  }

  async send(body) {
    if (!this.dispatch(el, 'ajax:before')) return

    let targetIds = []
    let targets = this.targets.map(id => {
      let target = document.getElementById(id)
      if (!target) {
        throw new MissingTargetError(id)
      }

      targetIds.push(id)
      target.setAttribute('aria-busy', 'true')

      return target
    })

    if (this.sync) {
      document.querySelectorAll('[x-sync]').forEach(el => {
        let id = el.getAttribute('id')
        if (!id) {
          throw new MissingIdError(el)
        }


        if (!targets.some(target => target.getAttribute('id') === id)) {
          targetIds.push(id)
          targets.push(el)
          el.setAttribute('aria-busy', 'true')
        }
      })
    }

    let response = new AjaxRequest(this.method, this.action, this.referrer)
      .setHeaders({
        'X-Alpine-Target': targetIds.join('  '),
        ...this.headers,
      })
      .followRedirects(this.followRedirects)
      .send(body)

    if (response.ok) {
      this.dispatch('ajax:success', response)
    } else {
      this.dispatch('ajax:error', response)
    }

    this.dispatch('ajax:after', response)

    if (!response.html) return

    if (this.history) {
      updateHistory(this.history, response.url)
    }

    let wrapper = document.createRange().createContextualFragment('<template>' + response.html + '</template>')
    let fragment = wrapper.firstElementChild.content
    let focused = !this.focus
    let renders = targets.map(async target => {
      let content = fragment.getElementById(target.getAttribute('id'))
      let strategy = MergeTargets.get(target)?.strategy || settings.mergeStrategy
      if (!content) {
        if (!this.dispatch('ajax:missing', { response, fragment })) {
          return
        }

        if (response.ok) {
          return target.remove();
        }

        throw new FailedResponseError(el)
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

      if (!this.dispatch('ajax:merge', { strategy, content, merge: mergeContent })) {
        return
      }

      return mergeContent()
    })

    return await Promise.all(renders)
  }
}

class AjaxAnchorElement extends AjaxElement {
  constructor(el, target = '') {
    super(el, target)
    this.method = 'GET'
    this.el.addEventListener('click', handleClick)
  }

  async handleClick(event) {
    if (event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }

    event.preventDefault()

    this.referrer = this.nearestSource()
    this.action = el.href

    try {
      return await render()
    } catch (error) {
      if (!(error instanceof FailedResponseError)) {
        throw error
      }

      console.warn(error.message)
      window.url.href = el.href
    }
  }

  destruct() {
    this.el.removeEventListener('click', handleClick)
  }
}

class AjaxFormElement extends AjaxElement {
  constructor(el, target = '') {
    super(el, target)
    this.el.addEventListener('submit', handleSubmit)
  }

  async handleSubmit(event) {
    if (event.submitter && event.submitter.hasAttribute('formnoajax')) {
      return
    }

    event.preventDefault()

    this.method = (this.el.getAttribute('method') || 'GET').toUpperCase()
    this.referrer = this.nearestSource()
    this.action = this.el.getAttribute('action') || this.referrer || window.url.href
    this.enctype = this.el.getAttribute('enctype') || this.enctype

    let data = new FormData(this.el)
    let name = event.submitter?.getAttribute("name")
    if (name) {
      data.append(name, event.submitter.getAttribute('value') || '')
    }

    try {
      return this.send(data)
    } catch (error) {
      if (!(error instanceof FailedResponseError)) {
        throw error
      }

      console.warn(error.message)
      el.removeEventListener('submit', handler)
      el.requestSubmit(event.submitter)
    }
  }

  destruct() {
    this.el.removeEventListener('submit', handleSubmit)
  }
}

class AjaxRequest {
  construct(method, action, referrer = null) {
    this.action = action
    this.method = method
    this.headers = {
      'X-Alpine-Request': 'true',
      ...settings.headers,
    }
    this.referrer = referrer
    this.redirectHandler = (response) => response
  }

  setHeaders(headers = {}) {
    Object.assign(this.headers, headers)

    return this
  }

  followRedirects(follow) {
    this.redirectHandler = follow
      ? (response) => response
      : (response) => {
        if (response.redirected) {
          window.location.href = response.url
          return
        }

        return response
      }

    return this
  }

  send(data = null) {
    let body = parseFormData(data)
    if (this.method === 'GET') {
      this.mergeBodyIntoAction(body)
      this.body = null
    } else if (this.enctype !== 'multipart/form-data') {
      this.body = this.formDataToParams(body)
    }
  }

  mergeBodyIntoAction(body) {
    let params = this.formDataToParams(body)

    if (Array.from(params).length) {
      let parts = this.action.split('#')
      let hash = parts[1]
      this.action += parts[0].includes('?') ? '&' : '?'
      this.action += params
      if (hash) {
        this.action += '#' + hash
      }
    }
  }

  formDataToParams(body) {
    let params = Array.from(body.entries()).filter(([key, value]) => {
      return !(value instanceof File)
    })

    return new URLSearchParams(params)
  }
}

class MergeTarget {
  construct(el, strategy, transition) {
    this.strategy = strategy
    this.transition = transition(modifiers)

    MergeTargets.set(el, this)
  }
}

class Snapshot {
  constructor(url, html) {
    this.url = url
    this.html = html
  }
}

let Snapshots = {
  currentKey: null,
  currentUrl: null,
  keys: [],
  snapshots: {},

  limit: settings.snapshotLimit,

  has(url) {
    return this.snapshots[url] !== undefined
  },

  get(url) {
    let snapshot = this.snapshots[url]

    if (!snapshot) {
      throw new Error('No snapshot found for ' + url)
    }

    return snapshot
  },

  replace(key, snapshot) {
    if (this.has(key)) {
      this.snapshots[key] = snapshot
    } else {
      this.push(key, snapshot)
    }
  },

  push(key, snapshot) {
    this.snapshots[key] = snapshot
    let index = this.keys.indexOf(key)
    if (index > -1) {
      this.keys.splice(index, 1)
    }
    this.keys.unshift(key)
    this.trim()
  },

  trim() {
    for (let key of this.keys.splice(this.limit)) {
      delete this.snapshots[key]
    }
  }
}

function Ajax(Alpine) {
  if (Alpine.morph) doMorph = Alpine.morph

  Alpine.directive('target', (el, { modifiers, expression }, { evaluate, cleanup }) => {
    let ajaxEl = new AjaxElement(
      el,
      expression,
      modifiers.includes('push') ? 'push' : (modifiers.includes('replace') ? 'replace' : false),
      !modifiers.includes('nofocus'),
    )
    ajaxEl.focus = !modifiers.includes('nofocus')
    ajaxEl.followRedirects = settings.followRedirects ? !modifiers.includes('nofollow') : modifiers.includes('follow')
    ajaxEl.headers = evaluate(Alpine.bound(el, 'x-headers', '{}'))
    ajaxEl.history = modifiers.includes('push') ? 'push' : (modifiers.includes('replace') ? 'replace' : false)

    cleanup(ajaxEl.destruct)
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('merge')}]`)

  Alpine.directive('merge', (el, { modifiers, expression }) => {
    new MergeTarget(
      el,
      expression,
      settings.transitions || modifiers.includes('transition')
    )
  })

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      options = Object.assign({
        focus: false,
        followRedirects: true,
        history: false,
        headers: null,
        sync: false,
        body: null,
        enctype: 'application/x-www-form-urlencoded',
        events: false,
        method: 'GET',
      }, options)

      options.method = options.method.toUpperCase()

      let ajaxEl = Object.assign(
        new AjaxElement(el, options.targets || options.target),
        options
      )
      ajaxEl.action = action
      ajaxEl.disableEvents(options.events)

      return ajaxEl.send(options.body)
    }
  })
}

Ajax.configure = (options) => {
  settings = Object.assign(settings, options)

  return Ajax
}

export default Ajax

function parseFormData(data) {
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

  if (!MergeTargets.get(from)?.transition || !document.startViewTransition) {
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
    push: () => window.history.pushState({ __AJAX__: true }, '', url),
    replace: () => window.history.replaceState({ __AJAX__: true }, '', url),
  }

  return strategies[strategy]();
}

class InvalidElement extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`AjaxElement cannot extend ${description}.`)
    this.name = 'Invalid Element'
  }
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

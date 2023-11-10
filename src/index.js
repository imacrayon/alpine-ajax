import './polyfills'
import { send } from './send'
import { morph as AlpineMorph } from '@alpinejs/morph'

let globalConfig = {
  followRedirects: true,
  mergeStrategy: 'replace',
}
let sendConfig = new WeakMap()
let mergeConfig = new WeakMap()

function Ajax(Alpine) {
  Alpine.directive('target', (el, { modifiers, expression }, { cleanup }) => {
    let config = {
      targets: parseIds(el, expression),
      followRedirects: followRedirects(modifiers)
    }

    sendConfig.set(el, config)

    if (isLocalLink(el)) {
      cleanup(listenForNavigate(el, config))
    } else if (isForm(el)) {
      cleanup(listenForSubmit(el, config))
    }
  })

  Alpine.directive('merge', (el, { expression }) => {
    mergeConfig.set(el, {
      strategy: expression,
    })
  })

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      let method = options.method ? options.method.toUpperCase() : 'GET'

      let body = null
      if (options.body) {
        if (options.body instanceof HTMLFormElement) {
          body = new FormData(options.body)
        } else {
          body = new FormData
          for (let key in options.body) {
            body.append(key, options.body[key])
          }
        }

        if (method === 'GET') {
          action = mergeBodyIntoAction(body, action)
          body = null
        }
      }

      let request = {
        action,
        method,
        body,
        referrer: source(el),
      }

      let behavior = sendConfig.get(el) || {
        followRedirects: globalConfig.followRedirects
      }
      behavior = Object.assign(behavior, options)

      let ids = parseIds(el, behavior.targets || behavior.target)
      let targets = findTargets(ids)
      targets = behavior.sync ? addSyncTargets(targets) : targets

      let dispatcher = behavior.events ? dispatch : () => true

      return render(request, targets, el, dispatcher, redirectHandler(behavior.followRedirects))
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

function followRedirects(modifiers = []) {
  return globalConfig.followRedirects
    ? !modifiers.includes('nofollow')
    : modifiers.includes('follow')
}

function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

function isForm(el) {
  return el.tagName === 'FORM'
}

function listenForNavigate(el, sendConfig) {
  let handler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(findTargets(sendConfig.targets))
    let request = navigateRequest(el)

    try {
      return await render(request, targets, el, dispatch, redirectHandler(sendConfig.followRedirects))
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

function listenForSubmit(el, sendConfig) {
  let handler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(findTargets(sendConfig.targets))
    let request = formRequest(el, event.submitter)

    try {
      return await withSubmitter(event.submitter, () => {
        return render(request, targets, el, dispatch, redirectHandler(sendConfig.followRedirects))
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
  let referrer = source(form)
  let action = form.getAttribute('action') || referrer || window.location.href
  let body = new FormData(form)
  if (submitter && submitter.name) {
    body.append(submitter.name, submitter.value)
  }
  if (method === 'GET') {
    action = mergeBodyIntoAction(body, action)
    body = null
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
  let params = Array.from(body.entries()).filter(([key, value]) => value !== '' || value !== null)
  if (params.length) {
    let parts = action.split('#')
    action = parts[0]
    if (!action.includes('?')) {
      action += '?'
    } else {
      action += '&'
    }
    action += new URLSearchParams(params)
    let hash = parts[1]
    if (hash) {
      action += '#' + hash
    }
  }

  return action
}

async function render(request, targets, el, dispatch, redirectHandler) {
  if (!dispatch(el, 'ajax:before')) return

  targets.forEach(target => {
    target.setAttribute('aria-busy', 'true')
  })

  let response = await send(request, redirectHandler)

  if (response.ok) {
    dispatch(el, 'ajax:success', response)
  } else {
    dispatch(el, 'ajax:error', response)
  }

  dispatch(el, 'ajax:after', response)

  if (!response.html) return

  let fragment = document.createRange().createContextualFragment(response.html)
  targets = targets.map(target => {
    let template = fragment.getElementById(target.id)
    let strategy = mergeConfig.get(target)?.strategy || globalConfig.mergeStrategy
    if (!template) {
      if (!dispatch(el, 'ajax:missing', response)) {
        return
      }

      if (!target.hasAttribute('x-sync')) {
        console.warn(`Target #${target.id} not found in AJAX response.`)
      }

      if (response.ok) {
        return merge(strategy, target, target.cloneNode(false))
      }

      throw new FailedResponseError(el)
    }

    let freshEl = merge(strategy, target, template)

    if (freshEl) {
      freshEl.removeAttribute('aria-busy')
      freshEl.dataset.source = response.url
    }

    return freshEl
  })

  let focus = el.getAttribute('x-focus')
  if (focus) {
    focusOn(document.getElementById(focus))
  }

  return targets
}

function merge(strategy, from, to) {
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
      AlpineMorph(from, to)

      return document.getElementById(to.id)
    }
  }

  return strategies[strategy](from, to)
}

function focusOn(el) {
  if (!el) return
  setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.focus()
  }, 0)
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

function redirectHandler(follow) {
  return follow
    ? (response) => response
    : (response) => {
      if (response.redirected) {
        window.location.href = response.url
        return
      }

      return response
    }
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

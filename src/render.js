import { FailedResponseError, MissingTargetError } from './helpers'
import { morph as AlpineMorph } from '@alpinejs/morph'

let queue = {}

let arrange = {
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
  remove(from) {
    from.remove()

    return null
  },
  morph(from, to) {
    AlpineMorph(from, to)

    return document.getElementById(to.id)
  }
}

export async function render(request, targets, el, events = true) {
  let dispatch = (name, detail = {}) => {
    return el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
  }

  if (!events) {
    dispatch = () => true
  }

  if (!dispatch('ajax:before')) return

  targets.forEach(target => {
    target.setAttribute('aria-busy', 'true')
  })

  let response = await send(request)
  if (response.ok) {
    dispatch('ajax:success', response)
  } else {
    dispatch('ajax:error', response)
  }

  dispatch('ajax:after', response)

  if (!response.html) return

  let fragment = document.createRange().createContextualFragment(response.html)
  targets = targets.map(target => {
    let template = fragment.getElementById(target.id)
    let strategy = target.getAttribute('x-arrange') || 'replace'
    if (!template) {
      if (!dispatch('ajax:missing', response)) {
        return
      }

      if (!target.hasAttribute('x-sync')) {
        console.warn(`Target #${target.id} not found in AJAX response.`)
      }

      if (response.ok) {
        return renderElement(strategy, target, target.cloneNode(false))
      }

      throw new FailedResponseError(el)
    }

    let freshEl = renderElement(strategy, target, template)

    if (freshEl) {
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

function renderElement(strategy, from, to) {
  return arrange[strategy](from, to)
}

async function send({ method, action, body, referrer }) {
  // When duplicate `GET` requests are issued we'll proxy
  // the initial request to save network roundtrips.
  let proxy
  let onSuccess = response => response
  let onError = error => error
  if (method === 'GET') {
    proxy = enqueue(action)
    if (isLocked(action)) {
      return proxy
    }
    onSuccess = response => dequeue(action, job => job.resolve(response))
    onError = error => dequeue(action, job => job.reject(error))
  }

  referrer = referrer || window.location.href

  let response = fetch(action, {
    headers: { 'X-Alpine-Request': 'true' },
    referrer,
    method,
    body,
  }).then(readHtml).then(onSuccess).catch(onError)

  return method === 'GET' ? proxy : response
}

function enqueue(key) {
  if (!queue[key]) {
    queue[key] = []
  }
  let job = {}
  let proxy = new Promise((resolve, reject) => {
    job.resolve = resolve
    job.reject = reject
  })
  queue[key].push(job)

  return proxy
}

function isLocked(key) {
  return queue[key].length > 1
}

function dequeue(key, resolver) {
  (queue[key] || []).forEach(resolver)
  queue[key] = undefined
}

function readHtml(response) {
  return response.text().then(html => {
    response.html = html
    return response
  })
}

function focusOn(el) {
  setTimeout(() => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    el.focus()
  }, 0);
}

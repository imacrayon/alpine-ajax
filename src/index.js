import './utils/submitter-polyfill'
import { morph } from '@alpinejs/morph/src/morph'

export default function (Alpine) {
  Alpine.directive('ajax', (el, { }, { cleanup }) => {
    progressivelyEnhanceLinks(el)
    let stopListeningForSubmit = listenForSubmit(el)
    let stoplisteningForNavigate = listenForNavigate(el)

    cleanup(() => {
      stopListeningForSubmit()
      stoplisteningForNavigate()
    })
  })

  Alpine.directive('load', (el, { value, modifiers, expression }, { cleanup }) => {
    // Checking for `data-source` prevents an infinite loop.
    if (!value && !el.dataset.source) {
      return handleLoad(el, 'GET', expression)
    }

    if (!value && modifiers.length) {
      let wait = modifiers[0].split('ms')[0]
      setTimeout(() => handleLoad(el, 'GET', expression), wait)
    }

    let stopListeningForServerEvent = listenForServerEvent(el, value, expression)

    cleanup(() => {
      stopListeningForServerEvent()
    })
  })
}

function progressivelyEnhanceLinks(el) {
  if (el.hasAttribute('data-action')) return
  if (isLocalLink(el)) {
    return convertLinkToButton(el)
  }
  el.querySelectorAll('[href]:not([noajax]):not([data-action])').forEach(link => {
    if (!isLocalLink(link) || isMarkedIgnored(link)) return
    convertLinkToButton(link)
  })
}

function isLocalLink(el) {
  return el.tagName === 'A' &&
    el.getAttribute('href') &&
    el.getAttribute('href').indexOf("#") !== 0 &&
    el.hostname === location.hostname
}

function isMarkedIgnored(el) {

  let root = el.closest('[x-ajax],[noajax]')
  return root.hasAttribute('noajax')
}

function convertLinkToButton(link) {
  link.setAttribute('role', 'button');
  link.dataset.action = link.getAttribute('href');
  link.tabIndex = 0;
  link.removeAttribute('href');
  link.addEventListener('keydown', event => event.keyCode === 32 && event.target.click())
}

function listenForSubmit(el) {
  let handler = event => {
    let form = event.target
    if (isMarkedIgnored(form)) return
    event.preventDefault()
    event.stopPropagation()
    let method = (form.getAttribute('method') || 'GET').toUpperCase()
    let action = form.getAttribute('action') || window.location.href
    let body = new FormData(form)
    let submitter = event.submitter
    let restoreFocus = false
    if (submitter) {
      restoreFocus = submitter === document.activeElement
      submitter.setAttribute('disabled', '')
      if (submitter.name) {
        body.append(submitter.name, submitter.value)
      }
    }
    handleAjax(el, form, method, action, body, submitter, restoreFocus)
  }

  el.addEventListener('submit', handler)

  return () => el.removeEventListener('submit', handler)
}

function listenForNavigate(el) {
  let handler = event => {
    let link = event.target
    let action = link.dataset.action
    if (!action) return
    event.preventDefault()
    event.stopPropagation()
    handleAjax(el, link, 'GET', action, null, null)
  }

  el.addEventListener('click', handler)

  return () => el.removeEventListener('click', handler)
}

function listenForServerEvent(el, event, action) {
  let handler = () => handleLoad(el, 'GET', action)
  window.addEventListener(event, handler)

  return () => window.removeEventListener(event, handler)
}

// TODO: This function is getting nasty, clean it up
async function handleAjax(root, el, method, action, body = null, submitter = null, restoreFocus = false) {
  let marker = el.closest('[x-target]')
  let ids = new Set(marker ? marker.getAttribute('x-target').split(' ').filter(id => id) : [root.id])
  ids.forEach(id => {
    let busy = document.getElementById(id)
    if (busy) busy.setAttribute('aria-busy', 'true')
  })
  let response = await makeRequest(el, method, action, body)
  if (!response.body) return

  // `disabled` is removed so that the submitter is persisted during DOM morph
  if (submitter) {
    submitter.removeAttribute('disabled')
    if (restoreFocus) {
      submitter.focus()
    }
  }
  replaceTargets(ids, response.body, response.url)
}

async function handleLoad(el, method, action) {
  let response = await makeRequest(el, method, action)
  if (!response.body) return

  replaceTargets(new Set([el.id]), response.body, response.url, false)
}

async function makeRequest(el, method, action, body = null) {
  if (!dispatch(el, 'ajax:before')) {
    return false
  }
  if (method === 'GET' && body) {
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
    body = null
  }

  let referrer = el.closest('[data-source]')?.dataset.source

  try {
    let response = await fetch(action, {
      headers: { 'X-Alpine-Request': 'true' },
      referrer,
      method,
      body,
    })

    if (!response.ok) {
      let error = new Error('Network response was not OK.')
      error.response = response
      throw error
    }

    dispatch(el, 'ajax:success', response)
    dispatch(el, 'ajax:after', response)

    return { url: response.url, body: await response.text() }
  } catch (error) {
    let response = error.response
    if (!response) throw error

    dispatch(el, 'ajax:error', response)
    dispatch(el, 'ajax:after', response)

    return { url: response.url, body: await response.text() }
  }
}

function dispatch(el, name, detail = {}) {
  return el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  )
}

function replaceTargets(targets, html, source, sync = true) {
  if (sync) {
    document.querySelectorAll('[x-sync]').forEach(el => {
      if (!el.id) return
      targets.add(el.id)
    })
  }

  let fragment = htmlToFragment(html)
  targets.forEach(async id => {
    let template = fragment.getElementById(id)
    if (!template) return

    template.dataset.source = source
    await morph(document.getElementById(id), template.outerHTML)
    progressivelyEnhanceLinks(document.getElementById(id))
  })
}

function htmlToFragment(html) {
  return document.createRange().createContextualFragment(html);
}

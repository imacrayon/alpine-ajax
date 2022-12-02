import './utils/submitter-polyfill'
import { morph } from '@alpinejs/morph/src/morph'

export default function (Alpine) {
  Alpine.directive('ajax', (el, { expression }, { cleanup }) => {
    let targets = expression.split(' ').filter(id => id)
    if (targets.length === 0) {
      targets = [el.id]
    }

    progressivelyEnhanceLinks(el)
    let stopListeningForSubmit = listenForSubmit(el, targets)
    let stoplisteningForNavigate = listenForNavigate(el, targets)

    cleanup(() => {
      stopListeningForSubmit()
      stoplisteningForNavigate()
    })
  })
}

function progressivelyEnhanceLinks(el) {
  if (el.hasAttribute('noajax') || el.hasAttribute('data-action')) return
  [el, ...Array.from(el.querySelectorAll('[href]:not([noajax]):not([data-action])'))].forEach(link => {
    if (! isLocalLink(link)) return
    link.setAttribute('role', 'button');
    link.setAttribute('data-action', link.getAttribute('href'));
    link.tabIndex = 0;
    link.removeAttribute('href');
    link.addEventListener('keydown', event => event.keyCode === 32 && event.target.click())
  })
}

function isLocalLink(el) {
  return el.tagName === 'A' &&
    el.getAttribute('href') &&
    el.getAttribute('href').indexOf("#") !== 0 &&
    el.hostname === location.hostname
}

function listenForSubmit(el, targets) {
  let handler = async event => {
    let form = event.target
    if (form.hasAttribute('noajax')) return
    event.preventDefault()
    event.stopPropagation()
    let method = (form.getAttribute('method') || 'GET').toUpperCase()
    let action = form.getAttribute('action') || window.location.href
    let body = new FormData(form)
    if (event?.submitter?.name) {
      body.append(submitter.name, submitter.value)
    }
    let html = await makeRequest(form, method, action, body)
    if (html === false) return
    replaceTargets(targets, html)
  }

  el.addEventListener('submit', handler)

  return () => el.removeEventListener('submit', handler)
}

function listenForNavigate(el, targets) {
  let handler = async event => {
    let link = event.target
    let action = link.dataset.action
    if (! action || link.hasAttribute('noajax')) return
    event.preventDefault()
    event.stopPropagation()
    let html = await makeRequest(link, 'GET', action, null)
    if (html === false) return
    replaceTargets(targets, html)
  }

  el.addEventListener('click', handler)

  return () => el.removeEventListener('click', handler)
}

async function makeRequest(el, method, action, body) {
  if (! dispatch(el, 'ajax:before')) {
    return false
  }
  if (method === 'GET' && body) {
    let params = Array.from(body.entries()).filter(([key, value]) => value !== '' || value !== null)
    if (params.length) {
      let parts = action.split('#')
      action = parts[0]
      if (! action.includes('?')) {
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

  return await fetch(action, { method, body })
    .then(response => {
      dispatch(el, 'ajax:success', response)
      dispatch(el, 'ajax:after', response)
      return response.text()
    })
    .catch(error => {
      dispatch(el, 'ajax:error', error)
      dispatch(el, 'ajax:after', error)
      return false
    })
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

function replaceTargets(targets, html) {
  let fragment = htmlToFragment(html)
  let activeElement = document.activeElement
  targets.forEach(id => morphTarget(id, fragment))
  if (activeElement) {
    activeElement.focus()
  }
}

function htmlToFragment(html) {
  return document.createRange().createContextualFragment(html);
}

function morphTarget(id, fragment) {
  let toHtml = fragment.getElementById(id)?.outerHTML ?? ''
  if (toHtml) {
    morph(document.getElementById(id), toHtml)
  } else {
    document.getElementById(id).replaceWith('')
  }
}

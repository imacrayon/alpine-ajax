import { request } from './utils/request'
import './utils/submitter-polyfill'

export default function (Alpine) {
  Alpine.addRootSelector(() => '[x-ajax]')

  Alpine.directive('ajax', (el, values, { cleanup }) => {
    let listeners = (['click', 'submit']).map(event => listenForAjaxEvent(el, event))

    cleanup(() => {
      listeners.forEach(remove => remove())
    })
  })
}

function listenForAjaxEvent(el, name) {
  let handler = event => {
    let source = getSourceElement(event.target, name)
    if (! isValidSourceElement(source)) return
    event.stopPropagation()
    event.preventDefault()
    let targetId = el.getAttribute('x-ajax')
    let target = targetId ? document.getElementById(targetId) : el
    if (! target?.id) {
      throw Error('You must specify an AJAX target with an ID.')
    }
    makeAjaxRequest(source, target, event)
  }

  el.addEventListener(name, handler)

  return () => {
    el.removeEventListener(name, handler)
  }
}

function getSourceElement(trigger, event) {
  let validTag = {
    submit: 'FORM',
    click: 'A',
  }

  return trigger.closest(validTag[event])
}

function isValidSourceElement(el) {
  if (! el) return false
  let root = el.closest('[x-ajax],[ajax-ignore]')
  if (root.hasAttribute('ajax-ignore')) return false
  return el.tagName === 'FORM' ? true : isLocalLink(el);
}

async function makeAjaxRequest(el, target, event) {
  if (el.hasAttribute('ajax-confirm') && !confirm(el.getAttribute('ajax-confirm'))) return;

  dispatch(el, 'ajax:before')

  try {
    let fragment = await requestFragment(requestOptions(el, event))

    target.replaceWith(fragment?.getElementById(target.id) ?? '')
    dispatch(el, 'ajax:success')
  } catch (error) {
    dispatch(el, 'ajax:error', error)
  }

  dispatch(el, 'ajax:after')
}

function dispatch(el, name, detail = {}) {
  el.dispatchEvent(
      new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
      })
  )
}

function requestOptions(el, event) {
  let defaults = {
    action: window.location.href,
    method: 'GET',
  }

  let data = el.tagName === 'FORM' ? new FormData(el) : new FormData()
  if (event.submitter?.name) {
    data.append(event.submitter.name, event.submitter.value)
  }

  return {
    data,
    action: el.getAttribute(isLocalLink(el) ? 'href' : 'action') || defaults.action,
    method: (el.getAttribute('method') || defaults.method).toUpperCase(),
  }
}

function isLocalLink(el) {
  return el.tagName === 'A' &&
    location.hostname === el.hostname &&
    el.getAttribute('href') &&
    el.getAttribute('href').indexOf("#") !== 0
}

async function requestFragment(options) {
  let response = ''
  try {
    response = await request(options.method, options.action, options.data, options)
  } catch (response) {
    throw Error(response.xhr.statusText)
  }

  return htmlToFragment(response)
}

function htmlToFragment(html) {
  return document.createRange().createContextualFragment(html);
}

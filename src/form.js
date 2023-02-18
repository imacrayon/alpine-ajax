import { targets, isIgnored } from './helpers'
import { render } from './render'

export function listenForSubmit(el) {
  let handler = event => {
    let form = event.target
    if (isIgnored(form)) return
    event.preventDefault()
    event.stopPropagation()
    return withSubmitter(event.submitter, () => {
      return render(formRequest(form, event.submitter), targets(el, form, true), form)
    })
  }

  el.addEventListener('submit', handler)

  return () => el.removeEventListener('submit', handler)
}

function formRequest(form, submitter = null) {
  let method = (form.getAttribute('method') || 'GET').toUpperCase()
  let action = form.getAttribute('action') || window.location.href
  let body = new FormData(form)
  if (method === 'GET') {
    action = mergeBodyIntoAction(body, action)
    body = null
  }
  if (submitter.name) {
    body.append(submitter.name, submitter.value)
  }
  let referrer = form.closest('[data-source]')?.dataset.source

  return { method, action, body, referrer }
}

async function withSubmitter(submitter, callback) {
  if (!submitter) return await callback()

  let disableEvent = e => e.preventDefault()

  submitter.setAttribute('aria-disabled', 'true')
  submitter.addEventListener('click', disableEvent)

  let focus = submitter === document.activeElement
  let result = await callback()

  submitter.removeAttribute('aria-disabled')
  submitter.removeEventListener('click', disableEvent)
  if (focus && submitter.isConnected) submitter.focus()

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

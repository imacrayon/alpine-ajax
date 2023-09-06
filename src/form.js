import { findTargets, addSyncTargets, config, dispatch, redirectHandler, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForSubmit(el, behavior) {
  let handler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(findTargets(behavior.targets))
    let request = formRequest(el, event.submitter)

    try {
      return await withSubmitter(event.submitter, () => {
        return render(request, targets, el, dispatch, redirectHandler(behavior.followRedirects))
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

export function mergeBodyIntoAction(body, action) {
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

import { hasTarget, targetIds, validateIds, syncIds, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForSubmit(el) {
  let handler = async (event) => {
    let form = event.target
    if (!hasTarget(form)) return
    event.preventDefault()
    event.stopPropagation()
    let ids = syncIds(validateIds(targetIds(form)))
    let request = formRequest(form, event.submitter)
    try {
      return await withSubmitter(event.submitter, () => {
        return render(request, ids, form)
      })
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message)
        form.removeAttribute('x-target')
        form.requestSubmit(event.submitter)
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

import { getTargets, addSyncTargets, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForNavigate(el, targetIds) {
  let handler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(getTargets(targetIds))
    let link = event.target
    let request = navigateRequest(link)
    try {
      return await render(request, targets, link)
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message)
        window.location.href = link.href
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

export function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

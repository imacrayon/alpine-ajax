import { hasTarget, parseIds, getTargets, addSyncTargets, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = async (event) => {
    let link = event.target
    if (!isLocalLink(link) || !hasTarget(link)) return
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(getTargets(parseIds(link)))
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

function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

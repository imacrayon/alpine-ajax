import { hasTarget, targetIds, validateIds, syncIds, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = async (event) => {
    let link = event.target
    if (!isLocalLink(link) || !hasTarget(link)) return
    event.preventDefault()
    event.stopPropagation()
    let ids = syncIds(validateIds(targetIds(link)))
    let request = navigateRequest(link)
    try {
      return await render(request, ids, link)
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

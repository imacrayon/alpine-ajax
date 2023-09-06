import { findTargets, addSyncTargets, config, dispatch, redirectHandler, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForNavigate(el, behavior) {
  let handler = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    let targets = addSyncTargets(findTargets(behavior.targets))
    let request = navigateRequest(el)

    try {
      return await render(request, targets, el, dispatch, redirectHandler(behavior.followRedirects))
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message)
        window.location.href = el.href
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

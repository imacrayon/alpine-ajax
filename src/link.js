import { targets, isIgnored, source, FailedResponseError } from './helpers'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = async (event) => {
    let link = event.target
    if (!isLocalLink(link) || isIgnored(link)) return
    event.preventDefault()
    event.stopPropagation()
    try {
      return await render(navigateRequest(link), targets(link, true), link)
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

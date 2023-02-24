import { targets, isIgnored, source } from './helpers'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = event => {
    let link = event.target
    if (!isLocalLink(link)) return
    event.preventDefault()
    event.stopPropagation()
    render(navigateRequest(link), targets(el, true, link), link)
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

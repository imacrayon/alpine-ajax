import { targets } from './helpers'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = event => {
    let link = event.target
    if (!link.dataset.action) return
    event.preventDefault()
    event.stopPropagation()
    render(navigateRequest(link), targets(el, link, true), link)
  }

  el.addEventListener('click', handler)

  return () => el.removeEventListener('click', handler)
}

function navigateRequest(link) {
  return {
    method: 'GET',
    action: link.dataset.action,
    referrer: link.closest('[data-source]')?.dataset.source,
    body: null
  }
}

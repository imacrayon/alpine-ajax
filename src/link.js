import { targets, isIgnored } from './helpers'
import { isPrefetchable } from './prefetch'
import { render } from './render'

export function listenForNavigate(el) {
  let handler = event => {
    let link = event.target
    if (!link.dataset.href) return
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
    action: link.dataset.href,
    referrer: link.closest('[data-source]')?.dataset.source,
    body: null
  }
}

export function progressivelyEnhanceLinks(el) {
  if (el.hasAttribute('data-href')) return
  if (isLocalLink(el)) {
    return convertLinkToButton(el)
  }
  el.querySelectorAll('[href]:not([noajax]):not([data-href])').forEach(link => {
    if (!isLocalLink(link) || isIgnored(link)) return
    convertLinkToButton(link)
  })

  return el
}

function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

function convertLinkToButton(link) {
  link.setAttribute('role', 'button')
  link.dataset.href = link.getAttribute('href')
  link.tabIndex = 0
  if (isPrefetchable(link)) {
    link.dataset.prefetch = 'true'
  }
  link.removeAttribute('href')
  link.addEventListener('keydown', event => (event.keyCode === 32 || event.keyCode === 13) && event.target.click())
}

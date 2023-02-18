import { targets, isIgnored } from './helpers'
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

export function progressivelyEnhanceLinks(el) {
  if (el.hasAttribute('data-action')) return
  if (isLocalLink(el)) {
    return convertLinkToButton(el)
  }
  el.querySelectorAll('[href]:not([noajax]):not([data-action])').forEach(link => {
    if (!isLocalLink(link) || isIgnored(link)) return
    convertLinkToButton(link)
  })

  return el
}

function isLocalLink(el) {
  return el.tagName === 'A' &&
    el.getAttribute('href') &&
    el.getAttribute('href').indexOf("#") !== 0 &&
    el.hostname === location.hostname
}

function convertLinkToButton(link) {
  link.setAttribute('role', 'button')
  link.dataset.action = link.getAttribute('href')
  link.tabIndex = 0
  link.removeAttribute('href')
  link.addEventListener('keydown', event => event.keyCode === 32 && event.target.click())
}

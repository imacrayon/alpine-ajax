// Most of this code is borrowed from https://github.com/instantpage/instant.page
// and modified to work with progressively enhanced buttons.

let lastTouchedAt
let mouseoverTimer
let TOUCH_THRESHOLD = 1111
let prefetched = new Set()

export function isPrefetchable(el) {
  if (!el || el.hasAttribute('noprefetch')) {
    return false
  }

  if (el.dataset.prefetch) {
    return true
  }

  return el.href && !el.hash &&
    el.origin == location.origin &&
    ['http:', 'https:'].includes(el.protocol) &&
    (location.protocol == 'http:' ? el.protocol == 'http:' : true)
}

export function listenForPrefetch(el) {
  el.addEventListener('touchstart', touchstartListener, { capture: true, passive: true })
  el.addEventListener('mouseover', mouseoverListener, { capture: true, passive: true })
}

function touchstartListener(event) {
  // Chrome on Android triggers mouseover before touchcancel, so
  // `lastTouchedAt` must be assigned on touchstart to be measured
  // on mouseover.
  lastTouchedAt = performance.now()

  let link = event.target.closest('a')

  if (!isPrefetchable(link)) {
    return
  }

  prefetch(link.href || link.dataset.href, 'high')
}

function mouseoverListener(event) {
  if (performance.now() - lastTouchedAt < TOUCH_THRESHOLD) {
    return
  }

  if (!('closest' in event.target)) {
    return // https://github.com/instantpage/instant.page/issues/66
  }
  let link = event.target.closest('a')

  if (!isPrefetchable(link)) {
    return
  }

  link.addEventListener('mouseout', mouseoutListener, { passive: true })

  mouseoverTimer = setTimeout(() => {
    prefetch(link.href || link.dataset.href, 'high')
    mouseoverTimer = undefined
  }, 65)
}

function mouseoutListener(event) {
  if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
    return
  }

  if (mouseoverTimer) {
    clearTimeout(mouseoverTimer)
    mouseoverTimer = undefined
  }
}

function prefetch(url, fetchPriority = 'auto') {
  if (prefetched.has(url)) {
    return
  }

  let linkElement = document.createElement('link')
  linkElement.rel = 'prefetch'
  linkElement.href = url
  linkElement.fetchPriority = fetchPriority
  document.head.appendChild(linkElement)

  prefetched.add(url)
}

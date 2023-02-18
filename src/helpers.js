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

export function targets(root, trigger = null, sync = false) {
  let ids = []
  if (trigger && trigger.hasAttribute('x-target')) {
    ids = trigger.getAttribute('x-target').split(' ')
  } else if (root.hasAttribute('x-target')) {
    ids = root.getAttribute('x-target').split(' ')
  } else {
    ids = [root.id]
  }

  ids = ids.filter(id => id)

  if (ids.length === 0) {
    let description = (root.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    throw Error(`${description} is missing an ID to target.`)
  }

  if (sync) {
    document.querySelectorAll('[x-sync]').forEach(el => {
      if (!el.id) {
        let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[x-sync]'
        throw Error(`${description} is missing an ID to target.`)
      }

      if (!ids.includes(el.id)) {
        ids.push(el.id)
      }
    })
  }

  return ids
}

export function isIgnored(el) {
  let root = el.closest('[x-ajax],[noajax]')
  return root.hasAttribute('noajax')
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

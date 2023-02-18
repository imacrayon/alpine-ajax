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

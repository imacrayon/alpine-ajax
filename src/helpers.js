export let Alpine

export function setAlpine(alpine) {
  Alpine = alpine
}

export function targets(root, sync = false, trigger = null) {
  let ids = []
  if (trigger && trigger.hasAttribute('target')) {
    ids = trigger.getAttribute('target').split(' ')
  } else if (root.hasAttribute('target')) {
    ids = root.getAttribute('target').split(' ')
  } else {
    ids = [root.id]
  }

  ids = ids.filter(id => id)

  if (ids.length === 0) {
    throw new MissingIdError(root)
  }

  if (sync) {
    document.querySelectorAll('[x-sync]').forEach(el => {
      if (!el.id) {
        throw new MissingIdError(el)
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

export class MissingIdError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`)
    this.name = 'Target Missing ID'
  }
}

export function source(el) {
  return el.closest('[data-source]')?.dataset.source
}

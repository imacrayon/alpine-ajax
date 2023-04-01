export let Alpine

export function setAlpine(alpine) {
  Alpine = alpine
}

export function targets(el, sync = false) {
  el = el.closest('[x-target],[x-ajax]') ?? el
  let ids = el.hasAttribute('x-target')
    ? el.getAttribute('x-target').split(' ')
    : [el.id]

  ids = ids.filter(id => id)

  if (ids.length === 0) {
    throw new MissingIdError(el)
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
  let root = el.closest('[x-ajax],[x-noajax]')
  return root.hasAttribute('x-noajax')
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
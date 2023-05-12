export function targetIds(el) {
  let target = el.getAttribute('x-target')

  return target ? target.split(' ') : [el.id]
}

export function validateIds(ids = []) {
  ids = ids.filter(id => id)

  if (ids.length === 0) {
    throw new MissingIdError(el)
  }

  return ids
}

export function syncIds(ids = []) {
  document.querySelectorAll('[x-sync]').forEach(el => {
    if (!el.id) {
      throw new MissingIdError(el)
    }

    if (!ids.includes(el.id)) {
      ids.push(el.id)
    }
  })

  return ids
}

export function hasTarget(el) {
  return el.hasAttribute('x-target')
}

export class MissingIdError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`)
    this.name = 'Target Missing ID'
  }
}

export class FailedResponseError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} received a failed response.`)
    this.name = 'Failed Response'
  }
}

export function source(el) {
  return el.closest('[data-source]')?.dataset.source
}

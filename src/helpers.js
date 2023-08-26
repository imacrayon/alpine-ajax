export let configuration = {
  followRedirects: false,
  mergeStrategy: 'replace',
}

export function configure(options) {
  configuration = Object.assign(configuration, options)

  return configuration
}

export function parseIds(el, expression = '') {
  let ids = expression ? expression.split(' ') : [el.id]

  if (ids.length === 0) {
    throw new MissingIdError(el)
  }

  return ids
}

export function getTargets(ids = []) {
  ids = ids.filter(id => id)

  return ids.map(id => {
    let target = document.getElementById(id)
    if (!target) {
      throw new MissingTargetError(id)
    }

    return target
  })
}

export function addSyncTargets(targets) {
  document.querySelectorAll('[x-sync]').forEach(el => {
    if (!el.id) {
      throw new MissingIdError(el)
    }

    if (!targets.some(target => target.id === el.id)) {
      targets.push(el)
    }
  })

  return targets
}

export class MissingIdError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`)
    this.name = 'Target Missing ID'
  }
}

export class MissingTargetError extends Error {
  constructor(id) {
    super(`#${id} was not found in the current document.`)
    this.name = 'Missing Target'
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

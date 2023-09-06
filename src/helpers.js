export let config = {
  followRedirects: true,
  mergeStrategy: 'replace',
}

export function configure(options) {
  config = Object.assign(config, options)

  return config
}

export function findTargets(ids = []) {
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

export function dispatch(el, name, detail) {
  return el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  )
}

export function redirectHandler(follow) {
  return follow
    ? (response) => response
    : (response) => {
      if (response.redirected) {
        window.location.href = response.url
        return
      }

      return response
    }
}

export class MissingIdError extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]'
    super(`${description} is missing an ID to target.`)
    this.name = 'Missing ID'
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

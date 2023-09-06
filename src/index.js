import { findTargets, addSyncTargets, dispatch, redirectHandler, config, configure, MissingIdError, source } from './helpers'
import { render } from './render'
import { listenForNavigate } from './link'
import { listenForSubmit, mergeBodyIntoAction } from './form'
import './polyfills'

let behaviors = new WeakMap()

function Ajax(Alpine) {
  Alpine.directive('target', (el, { modifiers, expression }, { cleanup }) => {
    let behavior = {
      targets: parseIds(el, expression),
      followRedirects: followRedirects(modifiers)
    }


    behaviors.set(el, behavior)

    if (isLocalLink(el)) {
      cleanup(listenForNavigate(el, behavior))
    } else if (isForm(el)) {
      cleanup(listenForSubmit(el, behavior))
    }
  })

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      let method = options.method ? options.method.toUpperCase() : 'GET'

      let body = null
      if (options.body) {
        if (options.body instanceof HTMLFormElement) {
          body = new FormData(options.body)
        } else {
          body = new FormData
          for (let key in options.body) {
            body.append(key, options.body[key])
          }
        }

        if (method === 'GET') {
          action = mergeBodyIntoAction(body, action)
          body = null
        }
      }

      let request = {
        action,
        method,
        body,
        referrer: source(el),
      }

      let behavior = behaviors.get(el) || {
        followRedirects: config.followRedirects
      }
      behavior = Object.assign(behavior, options)

      let ids = parseIds(el, behavior.targets || behavior.target)
      let targets = findTargets(ids)
      targets = behavior.sync ? addSyncTargets(targets) : targets

      let dispatcher = behavior.events ? dispatch : () => true

      return render(request, targets, el, dispatcher, redirectHandler(behavior.followRedirects))
    }
  })
}

Ajax.configure = (options) => {
  configure(options)

  return Ajax
}

export default Ajax

function parseIds(el, expression = null) {
  let ids = [el.id]
  if (expression) {
    ids = Array.isArray(expression) ? expression : expression.split(' ')
  }
  ids = ids.filter(id => id)

  if (ids.length === 0) {
    throw new MissingIdError(el)
  }

  return ids
}

function followRedirects(modifiers = []) {
  return config.followRedirects
    ? !modifiers.includes('nofollow')
    : modifiers.includes('follow')
}

function isLocalLink(el) {
  return el.href &&
    !el.hash &&
    el.origin == location.origin
}

function isForm(el) {
  return el.tagName === 'FORM'
}

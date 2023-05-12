import { targetIds, validateIds, syncIds, source } from './helpers'
import { render } from './render'
import { listenForNavigate } from './link'
import { listenForSubmit } from './form'
import './polyfills'

export default function (Alpine) {
  listenForSubmit(window)
  listenForNavigate(window)

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      let ids = options.target ? options.target.split(' ') : targetIds(el)
      ids = validateIds(ids)
      ids = options.sync ? syncIds(ids) : ids

      let body = null
      if (options.body) {
        if (options.body instanceof HTMLFormElement) {
          body = new FormData(options.body)
        } else {
          body = new FormData
          for (let key in options.body) {
            body.append(key, options.body[key]);
          }
        }
      }

      let request = {
        action,
        method: options.method ? options.method.toUpperCase() : 'GET',
        body,
        referrer: source(el),
      }

      return render(request, ids, el, Boolean(options.events))
    }
  })

  Alpine.addInitSelector(() => `[${Alpine.prefixed('load')}]`)

  Alpine.directive('load', (el, { expression }, { evaluate }) => {
    if (typeof expression === 'string') {
      return !!expression.trim() && evaluate(expression)
    }

    return evaluate(expression)
  })
}

import { parseIds, getTargets, addSyncTargets, source } from './helpers'
import { render } from './render'
import { listenForNavigate } from './link'
import { listenForSubmit } from './form'
import { listenForSubmit, mergeBodyIntoAction } from './form'
import './polyfills'

export default function (Alpine) {
  listenForSubmit(window)
  listenForNavigate(window)

  Alpine.magic('ajax', (el) => {
    return (action, options = {}) => {
      let ids = options.target ? options.target.split(' ') : parseIds(el)
      let targets = getTargets(ids)
      targets = options.sync ? addSyncTargets(targets) : targets

      let method = options.method ? options.method.toUpperCase() : 'GET'

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

      return render(request, targets, el, Boolean(options.events))
    }
  })
}

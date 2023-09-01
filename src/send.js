import { parseIds, getTargets, addSyncTargets, source } from './helpers'
import { render } from './render'
import { mergeBodyIntoAction } from './form'

export default function (Alpine) {
  Alpine.magic('send', (el) => {
    return () => {
      let method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].find(method => el.hasAttribute(`x-${method}`))

      let action = Alpine.bound(el, `x-${method}`)

      let body = new FormData
      body.append('data_stack', JSON.stringify(el._x_dataStack));

      if (method === 'GET') {
        action = mergeBodyIntoAction(body, action)
        body = null
      }

      let request = {
        action,
        method,
        body,
        referrer: source(el),
      }

      let targets = addSyncTargets(getTargets(parseIds(el, el.getAttribute('x-target'))))

      return render(request, targets, el, true)
    }
  })
}

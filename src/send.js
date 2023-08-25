import { parseIds, getTargets, addSyncTargets, source } from './helpers'
import { render } from './render'

export default function (Alpine) {
  Alpine.magic('send', (el) => {
    return () => {
      let method = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].find(method => el.hasAttribute(`x-${method}`))

      let body = el._x_dataStack.reduce((form, data) => {
        for (let key in data) {
          form.append(key, data[key]);
        }

        return form
      }, new FormData)

      let request = {
        action: Alpine.bound(el, `x-${method}`),
        method,
        body,
        referrer: source(el),
      }

      let targets = addSyncTargets(getTargets(parseIds(el)))

      return render(request, targets, el, true, 'morph')
    }
  })
}

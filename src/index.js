import './submitter-polyfill'
import { listenForLoad } from './load'
import { setAlpine, targets, source } from './helpers'
import { listenForSubmit } from './form'
import { listenForPrefetch } from './prefetch'
import { setRenderer, render } from './render'
import { listenForNavigate, progressivelyEnhanceLinks } from './link'

export default function (Alpine) {
  setAlpine(Alpine)
  setRenderer(Alpine.morph)

  if (document.body.hasAttribute('x-prefetch')) {
    listenForPrefetch(document)
  }

  Alpine.directive('ajax', (el, { }, { cleanup }) => {
    progressivelyEnhanceLinks(el)
    let stopListeningForSubmit = listenForSubmit(el)
    let stopListeningForNavigate = listenForNavigate(el)

    cleanup(() => {
      stopListeningForSubmit()
      stopListeningForNavigate()
    })
  })

  Alpine.magic('ajax', (el) => {
    return (action, options) => {
      let request = {
        action,
        method: options?.method ? options.method.toLowerCase() : 'get',
        body: options?.body ? new FormData(body) : null,
        referrer: source(el),
      }

      return render(request, targets(el, options?.sync), el)
    }
  })

  Alpine.directive('load', (el, { value, modifiers, expression }, { cleanup }) => {
    let delay = modifiers.length ? modifiers[0].split('ms')[0] : 0
    let stopListeningForLoad = listenForLoad(el, expression, value, delay)

    cleanup(() => {
      stopListeningForLoad()
    })
  })
}

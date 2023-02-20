import './submitter-polyfill'
import { targets } from './helpers'
import { listenForLoad } from './load'
import { listenForSubmit } from './form'
import { listenForPrefetch } from './prefetch'
import { setRenderer, render } from './render'
import { listenForNavigate, progressivelyEnhanceLinks } from './link'

export default function (Alpine) {
  setRenderer(Alpine.morph ?? (from => {
    console.warn(`You can't use Alpine AJAX without first installing the "morph" plugin here: https://alpinejs.dev/plugins/morph`)
    return from
  }))

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
        method: options?.method ? options.method.toUpperCase() : 'GET',
        body: options?.body,
        referrer: el.closest('[data-source]')?.dataset.source,
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

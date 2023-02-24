import { setAlpine, targets, source } from './helpers'
import { setRenderer, render } from './render'
import { listenForNavigate } from './link'
import { listenForSubmit } from './form'
import './submitter-polyfill'

export default function (Alpine) {
  setAlpine(Alpine)
  setRenderer(Alpine.morph)

  Alpine.addInitSelector(() => `[${Alpine.prefixed('ajax')}]`)

  Alpine.directive('ajax', (el, { }, { cleanup }) => {
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
        body: options?.body ? new FormData(body) : null,
        referrer: source(el),
      }

      return render(request, targets(el, options?.sync), el, Boolean(options?.events))
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

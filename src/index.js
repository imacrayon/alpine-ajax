import './submitter-polyfill'
import { listenForSubmit } from './form'
import { listenForNavigate } from './link'
import { listenForLoad } from './load'
import { progressivelyEnhanceLinks } from './link'
import { setRenderer } from './render'

export default function (Alpine) {
  setRenderer(Alpine.morph ?? (from => {
    console.warn(`You can't use Alpine AJAX without first installing the "morph" plugin here: https://alpinejs.dev/plugins/morph`)
    return from
  }))

  Alpine.directive('ajax', (el, { }, { cleanup }) => {
    progressivelyEnhanceLinks(el)
    let stopListeningForSubmit = listenForSubmit(el)
    let stopListeningForNavigate = listenForNavigate(el)

    cleanup(() => {
      stopListeningForSubmit()
      stopListeningForNavigate()
    })
  })

  Alpine.directive('load', (el, { value, modifiers, expression }, { cleanup }) => {
    let delay = modifiers.length ? modifiers[0].split('ms')[0] : 0
    let stopListeningForLoad = listenForLoad(el, expression, value, delay)

    cleanup(() => {
      stopListeningForLoad()
    })
  })
}

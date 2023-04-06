let submittersByForm = new WeakMap()

function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null
  const candidate = element ? element.closest('input, button') : null
  return candidate?.type == 'submit' ? candidate : null
}

function clickCaptured(event) {
  const submitter = findSubmitterFromClickTarget(event.target)

  if (submitter && submitter.form) {
    submittersByForm.set(submitter.form, submitter)
  }
}

; (function () {
  if ('submitter' in Event.prototype) return

  let prototype = window.Event.prototype
  // Patch Safari 15 SubmitEvent. See https://bugs.webkit.org/show_bug.cgi?id=229660
  if ('SubmitEvent' in window && /Apple Computer/.test(navigator.vendor)) {
    prototype = window.SubmitEvent.prototype
  } else if ('SubmitEvent' in window) {
    return // polyfill not needed
  }

  addEventListener('click', clickCaptured, true)

  Object.defineProperty(prototype, 'submitter', {
    get() {
      if (this.type == 'submit' && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target)
      }
    },
  })
})()

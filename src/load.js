import { render } from './render'
import { MissingIdError } from './helpers'

export function listenForLoad(el, action, event, delay = 0) {
  // Checking for `data-source` prevents an infinite loop.
  if (event) {
    return listenForEvent(event, el, action)
  } else if (delay > 0) {
    setTimeout(() => load(el, action), delay)
    return () => { }
  } else if (!el.dataset.source) {
    load(el, action)
    return () => { }
  }
}

function listenForEvent(event, el, action) {
  let handler = () => {
    load(el, action)
    window.removeEventListener(event, handler)
  }

  window.addEventListener(event, handler)

  return () => window.removeEventListener(event, handler)
}

function load(el, action) {
  if (!el.id) {
    throw new MissingIdError(el)
  }
  render({ method: 'get', action }, [el.id], el)
}

import ajax from '../src/index'

document.addEventListener('alpine:initializing', () => {
  ajax.configure(window.alpineAJAX || {})
  ajax(window.Alpine)
})

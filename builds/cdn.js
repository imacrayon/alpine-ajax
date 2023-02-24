import ajax from '../src/index'

document.addEventListener('alpine:initializing', () => {
  ajax(window.Alpine)
})

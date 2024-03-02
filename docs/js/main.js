import Alpine from 'alpinejs'
import ajax from '../../dist/module.esm'
import '../../dist/server'

window.Alpine = Alpine

// Load the ajax plugin within an event handler so
// script tag dependencies are initialized first
document.addEventListener('alpine:init', () => {
  window.Alpine.plugin(ajax)
});

window.Alpine.start()

window.example = function (action) {
  document.addEventListener('DOMContentLoaded', () => {
    window.fetch(action)
      .then(response => response.text())
      .then(html => document.getElementById('demo').innerHTML = html)
  })
}

window.escapeHtml = function (string) {
  let pre = document.createElement('pre')
  let text = document.createTextNode(string)
  pre.appendChild(text)

  return pre.innerHTML
}

import Alpine from 'alpinejs';
import ajax from '../../src/index'
import '../../dist/server'


Alpine.plugin(ajax)

window.Alpine = Alpine
Alpine.start();

window.example = function (action) {
  document.addEventListener('DOMContentLoaded', () => {
    window.fetch(action)
      .then(response => response.text())
      .then(html => document.getElementById('demo').innerHTML = html)
  })
}

window.escapeHtml = function (string) {
  let pre = document.createElement('pre');
  let text = document.createTextNode(string);
  pre.appendChild(text);

  return pre.innerHTML;
}

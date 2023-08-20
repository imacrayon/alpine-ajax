import Alpine from 'alpinejs';
import ajax from '../../src/index'


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

console.warn(`Mock Server running.`)
let routes = {}
window.route = (method, action, callback) => {
  routes[`${method.toUpperCase()} ${action}`] = callback
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('template[route]').forEach((template) => {
    let key = template.getAttribute('route').split(' ')
    key = key.length === 1 ? `GET ${key}` : `${key[0].toUpperCase()} ${key[1]}`
    routes[template.getAttribute('route')] = template.innerHTML
  })
  console.log(`Mock Server Routes:`, Object.keys(routes))
})

let realFetch = window.fetch
window.fetch = async (url, options = {}) => {
  let method = options.method || 'GET'
  method = method.toUpperCase()
  url = url.replace(location.origin, '')
  let key = `${method} ${url.split('?')[0]}`
  if (routes.hasOwnProperty(key) === false) {
    console.warn(`Mock Server Error: Missing route for [${method} ${url}].`)

    return realFetch(url, options)
  }

  let params = new URLSearchParams(url.split('?')[1])
  let data = formatData(options.body || new FormData, formatData(params))
  console.log(`Mock Server Request:`, { method, url, data })
  let body = evaluate(routes[key], data)
  if (document.body) {
    document.body.dispatchEvent(
      new CustomEvent('server:response', {
        detail: { method, url, data, body },
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
  }

  let response = {
    ok: true,
    url,
    text: () => Promise.resolve(body)
  }
  console.log(`Mock Server Response:`, response)

  return Promise.resolve(response)
}

function formatData(entries, params = {}) {
  entries.forEach((value, key) => {
    if (!params.hasOwnProperty(key)) {
      params[key] = value
      return
    }
    if (!Array.isArray(params[key])) {
      params[key] = [params[key]]
    }
    params[key].push(value)
  })

  return params
}

function evaluate(expression, data) {
  try {
    if (typeof expression === 'function') {
      return expression(data)
    }

    let escapedString = expression.replace(/`/, '\\`')

    return (new Function('$request', `with($request) { return \`${escapedString}\` }`))(data)
  } catch (error) {
    console.error(`Mock Server Evaluation Error:`, error)

    return ''
  }
}

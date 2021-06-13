import { request } from './utils/request'

let trigger = null

export default function (Alpine) {
  Alpine.addRootSelector(() => '[x-ajax]')

  Alpine.directive('ajax', (el, { expression }, { cleanup, evaluateLater, effect }) => {
    expression = expression === '' ? '{}' : expression
    let evaluate = evaluateLater(expression)

    let removeTriggerListener = () => {}
    if (el.tagName === 'FORM') {
      removeTriggerListener = on(el, 'click', event => { trigger = event.target })
    }

    let options = {}
    let removeDynamicListener = () => {}
    effect(() => {
      evaluate(values => {
        removeDynamicListener()
        options = ajaxOptions(el, values)
        removeDynamicListener = on(el, options.event, async event => {
          event.preventDefault()
          let fragment = await sendRequest(options)
          if (fragment) {
            let action = insertActions(fragment, options.target)[options.insert]
            if (! action) {
              throw Error(`Invalid insert action. Available actions are: ${Object.keys(insertActions()).join(', ')}`)
            }
            return Alpine.mutateDom(action)
          }
        })
      })
    })

    cleanup(() => {
      removeTriggerListener()
      removeDynamicListener()
      trigger = null
    })
  })
}

function on(el, event, handler) {
  el.addEventListener(event, handler)

  return () => {
    el.removeEventListener(event, handler)
  }
}

function ajaxOptions(el, values = {}) {
  let defaults = {
    event: el.tagName === 'FORM' ? 'submit' : 'click',
    action: window.location.href,
    method: 'GET',
    target: el,
    insert: 'update',
  }

  let options = Object.assign(defaults, values)
  options.method = el.getAttribute('method') || options.method
  options.method = options.method.toUpperCase()
  options.action = el.getAttribute('action') || options.action
  if (isLocalLink(el)) {
    options.action = el.getAttribute('href') || options.action
  }
  if (typeof options.target === 'string') {
    options.target = document.querySelector(options.target)
  }
  options.data = getFormData(options.data ?? el)

  return options
}

function isLocalLink(el) {
  return el.tagName === 'A' &&
    location.hostname === el.hostname &&
    el.getAttribute('href') &&
    el.getAttribute('href').indexOf("#") !== 0
}

function getFormData(data) {
  return data.tagName === 'FORM' ? new FormData(data) : valuesToFormData(data)
}

function valuesToFormData(values) {
  let formData = new FormData();
  for (let name in values) {
    if (values.hasOwnProperty(name)) {
      let value = values[name];
      if (Array.isArray(value)) {
        forEach(value, function(v) {
          formData.append(name, v);
        });
      } else {
        formData.append(name, value);
      }
    }
  }

  return formData;
}

async function sendRequest(options) {
  if (options.confirm && !confirm(options.confirm)) return;

  if (trigger && trigger.name) {
    options.data.append(trigger.name, trigger.value)
  }

  let response = null
  try {
    response = await request(options.method, options.action, options.data, options)
  } catch (response) {
    throw Error(response.xhr.statusText)
  }

  let fragment = textToFragment(response)

  if (options.select) {
    return fragment.querySelector(options.select)
  }

  return fragment
}

function textToFragment(text) {
  return document.createRange().createContextualFragment(text);
}

function insertActions(fragment, target) {
  return {
    after() {
      target?.parentElement?.insertBefore(fragment, target.nextSibling)
    },
    append() {
      target?.append(fragment)
    },
    before() {
      target?.parentElement?.insertBefore(fragment, target)
    },
    prepend() {
      target?.prepend(fragment)
    },
    replace() {
      if (target?.tagName === 'BODY') {
        return insertActions(fragment, target).update()
      }
      target?.replaceWith(fragment)
    },
    update() {
      if (target) {
        target.innerHTML = ''
        target.append(fragment)
      }
    }
  }
}

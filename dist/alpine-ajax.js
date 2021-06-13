(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function request(method, url, data, options) {
    if (method === 'GET') {
      let params = Array.from(data.entries()).filter(([key, value]) => value !== '' || value !== null);

      if (params.length) {
        let splitUrl = url.split('#');
        let anchor = splitUrl[1];
        url = splitUrl[0];

        if (url.includes('?')) {
          url += '?';
        } else {
          url += '&';
        }

        url += new URLSearchParams(params);

        if (anchor) {
          url += '#' + anchor;
        }
      }

      data = null;
    }

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.overrideMimeType('text/html');
      let headers = Object.assign({
        'X-Requested-With': 'XMLHttpRequest',
        'X-Alpine-Request': 'true'
      }, options.headers);

      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      if (options.progress && xhr.upload) {
        xhr.upload.addEventListener('progress', options.progress);
      }

      let info = {
        xhr,
        url,
        data,
        options
      };

      xhr.onload = function () {
        if (this.status >= 200 && this.status < 400) return resolve(xhr.response);
        reject(info);
      };

      xhr.onerror = function () {
        reject(info);
      };

      xhr.send(data);
    });
  }

  let trigger = null;
  function ajax (Alpine) {
    Alpine.addRootSelector(() => '[x-ajax]');
    Alpine.directive('ajax', (el, {
      expression
    }, {
      cleanup,
      evaluateLater,
      effect
    }) => {
      expression = expression === '' ? '{}' : expression;
      let evaluate = evaluateLater(expression);

      let removeTriggerListener = () => {};

      if (el.tagName === 'FORM') {
        removeTriggerListener = on(el, 'click', event => {
          trigger = event.target;
        });
      }

      let options = {};

      let removeDynamicListener = () => {};

      effect(() => {
        evaluate(values => {
          removeDynamicListener();
          options = ajaxOptions(el, values);
          removeDynamicListener = on(el, options.event, async event => {
            event.preventDefault();
            let fragment = await sendRequest(options);

            if (fragment) {
              let action = insertActions(fragment, options.target)[options.insert];

              if (!action) {
                throw Error(`Invalid insert action. Available actions are: ${Object.keys(insertActions()).join(', ')}`);
              }

              return Alpine.mutateDom(action);
            }
          });
        });
      });
      cleanup(() => {
        removeTriggerListener();
        removeDynamicListener();
        trigger = null;
      });
    });
  }

  function on(el, event, handler) {
    el.addEventListener(event, handler);
    return () => {
      el.removeEventListener(event, handler);
    };
  }

  function ajaxOptions(el, values = {}) {
    let defaults = {
      event: el.tagName === 'FORM' ? 'submit' : 'click',
      action: window.location.href,
      method: 'GET',
      target: el,
      insert: 'update'
    };
    let options = Object.assign(defaults, values);
    options.method = el.getAttribute('method') || options.method;
    options.method = options.method.toUpperCase();
    options.action = el.getAttribute('action') || options.action;

    if (isLocalLink(el)) {
      options.action = el.getAttribute('href') || options.action;
    }

    if (typeof options.target === 'string') {
      options.target = document.querySelector(options.target);
    }

    options.data = getFormData(options.data ?? el);
    return options;
  }

  function isLocalLink(el) {
    return el.tagName === 'A' && location.hostname === el.hostname && el.getAttribute('href') && el.getAttribute('href').indexOf("#") !== 0;
  }

  function getFormData(data) {
    return data.tagName === 'FORM' ? new FormData(data) : valuesToFormData(data);
  }

  function valuesToFormData(values) {
    let formData = new FormData();

    for (let name in values) {
      if (values.hasOwnProperty(name)) {
        let value = values[name];

        if (Array.isArray(value)) {
          forEach(value, function (v) {
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
      options.data.append(trigger.name, trigger.value);
    }

    let response = null;

    try {
      response = await request(options.method, options.action, options.data, options);
    } catch (response) {
      throw Error(response.xhr.statusText);
    }

    let fragment = textToFragment(response);

    if (options.select) {
      return fragment.querySelector(options.select);
    }

    return fragment;
  }

  function textToFragment(text) {
    return document.createRange().createContextualFragment(text);
  }

  function insertActions(fragment, target) {
    return {
      after() {
        var _target$parentElement;

        target === null || target === void 0 ? void 0 : (_target$parentElement = target.parentElement) === null || _target$parentElement === void 0 ? void 0 : _target$parentElement.insertBefore(fragment, target.nextSibling);
      },

      append() {
        target === null || target === void 0 ? void 0 : target.append(fragment);
      },

      before() {
        var _target$parentElement2;

        target === null || target === void 0 ? void 0 : (_target$parentElement2 = target.parentElement) === null || _target$parentElement2 === void 0 ? void 0 : _target$parentElement2.insertBefore(fragment, target);
      },

      prepend() {
        target === null || target === void 0 ? void 0 : target.prepend(fragment);
      },

      replace() {
        if ((target === null || target === void 0 ? void 0 : target.tagName) === 'BODY') {
          return insertActions(fragment, target).update();
        }

        target === null || target === void 0 ? void 0 : target.replaceWith(fragment);
      },

      update() {
        if (target) {
          target.innerHTML = '';
          target.append(fragment);
        }
      }

    };
  }

  document.addEventListener('alpine:initializing', () => {
    ajax(window.Alpine);
  });

})));
//# sourceMappingURL=alpine-ajax.js.map

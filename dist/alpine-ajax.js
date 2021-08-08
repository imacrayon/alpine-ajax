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

  function ajax (Alpine) {
    Alpine.addRootSelector(() => '[x-ajax]');
    Alpine.directive('ajax', (el, {
      expression
    }, {
      cleanup
    }) => {
      let target = expression ? document.getElementById(expression) : el;

      if (!(target !== null && target !== void 0 && target.id)) {
        throw Error('You must specify an AJAX target with an ID.');
      }

      let listeners = ['click', 'submit'].map(event => listenForAjaxEvent(el, event, target));
      cleanup(() => {
        listeners.forEach(remove => remove());
      });
    });
  }

  function listenForAjaxEvent(el, name, target) {
    let handler = event => {
      let source = getSourceElement(event.target, name);
      if (!isValidSourceElement(source)) return;
      event.preventDefault();
      makeAjaxRequest(source, target);
    };

    el.addEventListener(name, handler);
    return () => {
      el.removeEventListener(name, handler);
    };
  }

  function getSourceElement(trigger, event) {
    let validTag = {
      submit: 'FORM',
      click: 'A'
    };
    return trigger.closest(validTag[event]);
  }

  function isValidSourceElement(el) {
    if (!el) return false;
    let root = el.closest('[x-ajax],[ajax-ignore]');
    if (root.hasAttribute('ajax-ignore')) return false;
    return el.tagName === 'FORM' ? true : isLocalLink(el);
  }

  async function makeAjaxRequest(el, target) {
    if (el.hasAttribute('ajax-confirm') && !confirm(el.getAttribute('ajax-confirm'))) return;
    dispatch(el, 'ajax:before');

    try {
      let fragment = await requestFragment(requestOptionsFromElement(el));
      target.replaceWith((fragment === null || fragment === void 0 ? void 0 : fragment.getElementById(target.id)) ?? '');
      dispatch(el, 'ajax:success');
    } catch (error) {
      dispatch(el, 'ajax:error', error);
    }

    dispatch(el, 'ajax:after');
  }

  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true
    }));
  }

  function requestOptionsFromElement(el) {
    let defaults = {
      action: window.location.href,
      method: 'GET'
    };
    return {
      action: el.getAttribute(isLocalLink(el) ? 'href' : 'action') || defaults.action,
      data: el.tagName === 'FORM' ? new FormData(el) : new FormData(),
      method: (el.getAttribute('method') || defaults.method).toUpperCase()
    };
  }

  function isLocalLink(el) {
    return el.tagName === 'A' && location.hostname === el.hostname && el.getAttribute('href') && el.getAttribute('href').indexOf("#") !== 0;
  }

  async function requestFragment(options) {
    let response = '';

    try {
      response = await request(options.method, options.action, options.data, options);
    } catch (response) {
      throw Error(response.xhr.statusText);
    }

    return htmlToFragment(response);
  }

  function htmlToFragment(html) {
    return document.createRange().createContextualFragment(html);
  }

  document.addEventListener('alpine:initializing', () => {
    ajax(window.Alpine);
  });

})));
//# sourceMappingURL=alpine-ajax.js.map

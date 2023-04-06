// src/helpers.js
var Alpine;
function setAlpine(alpine) {
  Alpine = alpine;
}
function targets(el, sync = false) {
  el = el.closest("[x-target],[x-ajax]") ?? el;
  let ids = el.hasAttribute("x-target") ? el.getAttribute("x-target").split(" ") : [el.id];
  ids = ids.filter((id) => id);
  if (ids.length === 0) {
    throw new MissingIdError(el);
  }
  if (sync) {
    document.querySelectorAll("[x-sync]").forEach((el2) => {
      if (!el2.id) {
        throw new MissingIdError(el2);
      }
      if (!ids.includes(el2.id)) {
        ids.push(el2.id);
      }
    });
  }
  return ids;
}
function isIgnored(el) {
  let root = el.closest("[x-ajax],[x-noajax]");
  return root.hasAttribute("x-noajax");
}
var MissingIdError = class extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "[Element]";
    super(`${description} is missing an ID to target.`);
    this.name = "Target Missing ID";
  }
};
var FailedResponseError = class extends Error {
  constructor(el) {
    let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "[Element]";
    super(`${description} received a failed response.`);
    this.name = "Failed Response";
  }
};
function source(el) {
  return el.closest("[data-source]")?.dataset.source;
}

// src/render.js
var queue = {};
var renderElement;
function setRenderer(renderer) {
  renderElement = renderer || ((from) => {
    console.warn(`You can't use Alpine AJAX without first installing the "morph" plugin here: https://alpinejs.dev/plugins/morph`);
    return from;
  });
}
async function render(request, ids, el, events = true) {
  let dispatch = (name, detail = {}) => {
    return el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
  };
  if (!events) {
    dispatch = () => true;
  }
  if (!dispatch("ajax:before"))
    return;
  ids.forEach((id) => {
    let busy = document.getElementById(id);
    if (busy)
      busy.setAttribute("aria-busy", "true");
  });
  let response = await send(request);
  if (response.ok) {
    dispatch("ajax:success", response);
  } else {
    dispatch("ajax:error", response);
  }
  dispatch("ajax:after", response);
  if (!response.html)
    return;
  let fragment = document.createRange().createContextualFragment(response.html);
  let targets2 = ids.map((id) => {
    let template = fragment.getElementById(id);
    let target = document.getElementById(id);
    if (!template) {
      if (!dispatch("ajax:missing", response)) {
        return;
      }
      if (!target.hasAttribute("x-sync")) {
        console.warn(`Target #${id} not found in AJAX response.`);
      }
      if (response.ok) {
        return renderElement(target, target.cloneNode(false));
      }
      throw new FailedResponseError(el);
    }
    renderElement(target, template);
    let freshEl = document.getElementById(id);
    freshEl.dataset.source = response.url;
    return freshEl;
  });
  let focus = Alpine.bound(el, "focus");
  if (focus !== void 0) {
    if (targets2.length && typeof focus === "string") {
      focusOn(targets2[0].querySelector(Alpine.bound(el, "focus")));
    } else {
      focusOn(focus);
    }
  }
  return targets2;
}
async function send({ method, action, body, referrer }) {
  let proxy;
  let onSuccess = (response2) => response2;
  let onError = (error) => error;
  if (method === "GET") {
    proxy = enqueue(action);
    if (isLocked(action)) {
      return proxy;
    }
    onSuccess = (response2) => dequeue(action, (job) => job.resolve(response2));
    onError = (error) => dequeue(action, (job) => job.reject(error));
  }
  referrer = referrer || window.location.href;
  let response = fetch(action, {
    headers: { "X-Alpine-Request": "true" },
    referrer,
    method,
    body
  }).then(readHtml).then(onSuccess).catch(onError);
  return method === "GET" ? proxy : response;
}
function enqueue(key) {
  if (!queue[key]) {
    queue[key] = [];
  }
  let job = {};
  let proxy = new Promise((resolve, reject) => {
    job.resolve = resolve;
    job.reject = reject;
  });
  queue[key].push(job);
  return proxy;
}
function isLocked(key) {
  return queue[key].length > 1;
}
function dequeue(key, resolver) {
  (queue[key] || []).forEach(resolver);
  queue[key] = void 0;
}
function readHtml(response) {
  return response.text().then((html) => {
    response.html = html;
    return response;
  });
}
function focusOn(el) {
  setTimeout(() => {
    if (!el.hasAttribute("tabindex"))
      el.setAttribute("tabindex", "0");
    el.focus();
  }, 0);
}

// src/link.js
function listenForNavigate(el) {
  let handler = async (event) => {
    let link = event.target;
    if (!isLocalLink(link) || isIgnored(link))
      return;
    event.preventDefault();
    event.stopPropagation();
    try {
      return await render(navigateRequest(link), targets(link, true), link);
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message);
        window.location.href = link.href;
        return;
      }
      throw error;
    }
  };
  el.addEventListener("click", handler);
  return () => el.removeEventListener("click", handler);
}
function navigateRequest(link) {
  return {
    method: "GET",
    action: link.href,
    referrer: source(link),
    body: null
  };
}
function isLocalLink(el) {
  return el.href && !el.hash && el.origin == location.origin;
}

// src/form.js
function listenForSubmit(el) {
  let handler = async (event) => {
    let form = event.target;
    if (isIgnored(form))
      return;
    event.preventDefault();
    event.stopPropagation();
    try {
      return await withSubmitter(event.submitter, () => {
        return render(formRequest(form, event.submitter), targets(form, true), form);
      });
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message);
        form.setAttribute("x-noajax", "true");
        form.requestSubmit(event.submitter);
        return;
      }
      throw error;
    }
  };
  el.addEventListener("submit", handler);
  return () => el.removeEventListener("submit", handler);
}
function formRequest(form, submitter = null) {
  let method = (form.getAttribute("method") || "GET").toUpperCase();
  let referrer = source(form);
  let action = form.getAttribute("action") || referrer || window.location.href;
  let body = new FormData(form);
  if (submitter && submitter.name) {
    body.append(submitter.name, submitter.value);
  }
  if (method === "GET") {
    action = mergeBodyIntoAction(body, action);
    body = null;
  }
  return { method, action, body, referrer };
}
async function withSubmitter(submitter, callback) {
  if (!submitter)
    return await callback();
  let disableEvent = (e) => e.preventDefault();
  submitter.setAttribute("aria-disabled", "true");
  submitter.addEventListener("click", disableEvent);
  let result = await callback();
  submitter.removeAttribute("aria-disabled");
  submitter.removeEventListener("click", disableEvent);
  return result;
}
function mergeBodyIntoAction(body, action) {
  let params = Array.from(body.entries()).filter(([key, value]) => value !== "" || value !== null);
  if (params.length) {
    let parts = action.split("#");
    action = parts[0];
    if (!action.includes("?")) {
      action += "?";
    } else {
      action += "&";
    }
    action += new URLSearchParams(params);
    let hash = parts[1];
    if (hash) {
      action += "#" + hash;
    }
  }
  return action;
}

// src/polyfills/submitter.js
var submittersByForm = /* @__PURE__ */ new WeakMap();
function findSubmitterFromClickTarget(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return candidate?.type == "submit" ? candidate : null;
}
function clickCaptured(event) {
  const submitter = findSubmitterFromClickTarget(event.target);
  if (submitter && submitter.form) {
    submittersByForm.set(submitter.form, submitter);
  }
}
(function() {
  if ("submitter" in Event.prototype)
    return;
  let prototype = window.Event.prototype;
  if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
    prototype = window.SubmitEvent.prototype;
  } else if ("SubmitEvent" in window) {
    return;
  }
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }
  });
})();

// src/polyfills/request-submit.js
(function(prototype) {
  if (typeof prototype.requestSubmit == "function")
    return;
  prototype.requestSubmit = function(submitter) {
    if (submitter) {
      validateSubmitter(submitter, this);
      submitter.click();
    } else {
      submitter = document.createElement("input");
      submitter.type = "submit";
      submitter.hidden = true;
      this.appendChild(submitter);
      submitter.click();
      this.removeChild(submitter);
    }
  };
  function validateSubmitter(submitter, form) {
    submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
    submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
    submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
  }
  function raise(errorConstructor, message, name) {
    throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
  }
})(HTMLFormElement.prototype);

// src/index.js
function src_default(Alpine2) {
  setAlpine(Alpine2);
  setRenderer(Alpine2.morph);
  Alpine2.addInitSelector(() => `[${Alpine2.prefixed("ajax")}]`);
  Alpine2.directive("ajax", (el, {}, { cleanup }) => {
    let stopListeningForSubmit = listenForSubmit(el);
    let stopListeningForNavigate = listenForNavigate(el);
    cleanup(() => {
      stopListeningForSubmit();
      stopListeningForNavigate();
    });
  });
  Alpine2.magic("ajax", (el) => {
    return (action, options) => {
      let body = null;
      if (options && options.body) {
        if (options.body instanceof HTMLFormElement) {
          body = options.body;
        } else {
          body = new FormData();
          for (let key in options.body) {
            body.append(key, options.body[key]);
          }
        }
      }
      let request = {
        action,
        method: options?.method ? options.method.toUpperCase() : "GET",
        body,
        referrer: source(el)
      };
      return render(request, targets(el, options?.sync), el, Boolean(options?.events));
    };
  });
  Alpine2.addInitSelector(() => `[${Alpine2.prefixed("load")}]`);
  Alpine2.directive("load", (el, { expression }, { evaluate }) => {
    if (typeof expression === "string") {
      return !!expression.trim() && evaluate(expression);
    }
    return evaluate(expression);
  });
}

// builds/module.js
var module_default = src_default;
export {
  module_default as default
};

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// builds/module.js
var module_exports = {};
__export(module_exports, {
  default: () => module_default
});
module.exports = __toCommonJS(module_exports);

// src/index.js
var settings = {
  headers: {},
  followRedirects: true,
  mergeStrategy: "replace",
  transitions: false
};
var doMorph = (from, to) => {
  console.error(`You can't use the "morph" merge without first installing the Alpine "morph" plugin here: https://alpinejs.dev/plugins/morph`);
};
function debug() {
  console.debug(...arguments);
}
function Ajax(Alpine) {
  if (Alpine.morph)
    doMorph = Alpine.morph;
  Alpine.directive("target", (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setTargets = (ids) => {
      debug("[x-target]", el);
      AjaxAttributes.set(el, {
        targets: parseTargetIds(el, ids),
        focus: !modifiers.includes("nofocus"),
        history: modifiers.includes("push") ? "push" : modifiers.includes("replace") ? "replace" : false,
        follow: settings.followRedirects ? !modifiers.includes("nofollow") : modifiers.includes("follow")
      });
    };
    if (value === "dynamic") {
      let evaluate = evaluateLater(expression);
      effect(() => evaluate(setTargets));
    } else {
      setTargets(expression);
    }
  });
  Alpine.directive("headers", (el, { expression }, { evaluateLater, effect }) => {
    let evaluate = evaluateLater(expression || "{}");
    effect(() => {
      evaluate((headers) => {
        debug("[x-headers]", el);
        AjaxAttributes.set(el, { headers });
      });
    });
  });
  Alpine.addInitSelector(() => `[${Alpine.prefixed("merge")}]`);
  Alpine.directive("merge", (el, { value, modifiers, expression }, { evaluateLater, effect }) => {
    let setMerge = (strategy) => {
      debug("[x-merge]", el);
      AjaxAttributes.set(el, {
        strategy: strategy || settings.mergeStrategy,
        transition: settings.transitions || modifiers.includes("transition")
      });
    };
    if (value === "dynamic") {
      let evaluate = evaluateLater(expression);
      effect(() => evaluate(setMerge));
    } else {
      setMerge(expression);
    }
  });
  Alpine.magic("ajax", (el) => {
    return async (action, options = {}) => {
      let targets = findTargets(parseTargetIds(el, options.targets || options.target));
      targets = options.sync ? addSyncTargets(targets) : targets;
      let referrer = source(el);
      let headers = Object.assign({}, settings.headers, options.headers || {});
      let method = options.method ? options.method.toUpperCase() : "GET";
      let body = options.body;
      let follow = "followRedirects" in options ? options.followRedirects : settings.followRedirects;
      let response = await request(el, targets, action, referrer, headers, follow, method, body);
      let history = options.history || AjaxAttributes.get(el, "history");
      let focus = "focus" in options ? options.focus : AjaxAttributes.get(el, "focus", true);
      return render(response, el, targets, history, focus);
    };
  });
  let listeners = [];
  Alpine.ajax = {
    start() {
      if (!listeners.length) {
        listeners.push(addGlobalListener("submit", handleForms));
        listeners.push(addGlobalListener("click", handleLinks));
      }
    },
    stop() {
      listeners.forEach((ignore) => ignore());
      listeners = [];
    }
  };
  Alpine.ajax.start();
}
Ajax.configure = (options) => {
  settings = Object.assign(settings, options);
  return Ajax;
};
var src_default = Ajax;
var AjaxAttributes = {
  store: /* @__PURE__ */ new WeakMap(),
  set(el, config) {
    if (this.store.has(el)) {
      this.store.set(el, Object.assign(this.store.get(el), config));
    } else {
      this.store.set(el, config);
    }
  },
  get(el, key, fallback = null) {
    let config = this.store.get(el) || {};
    return key in config ? config[key] : fallback;
  },
  has(el) {
    return this.store.has(el);
  }
};
async function handleLinks(event) {
  if (event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    debug("Abort: Insignificant click event");
    return;
  }
  let link = event == null ? void 0 : event.target.closest("a[href]:not([download]):not([noajax])");
  if (!link && !debug('Abort: Failed selector "a[href]:not([download]):not([noajax])"') || !AjaxAttributes.has(link) && !debug("Abort: No [x-target] data") || link.isContentEditable && !debug("Abort: Has [contenteditable]") || link.getAttribute("href").startsWith("#") && !debug('Abort: [href] starts with "#"') || link.origin !== location.origin && !debug("Abort: Not same origin") || link.pathname + link.search === location.pathname + location.search && link.hash && !debug("Abort: Anchor only"))
    return;
  debug("Link is good!");
  event.preventDefault();
  event.stopImmediatePropagation();
  let targets = addSyncTargets(findTargets(AjaxAttributes.get(link, "targets", [])));
  let referrer = source(link);
  let action = link.getAttribute("href") || referrer;
  let headers = AjaxAttributes.get(link, "headers", {});
  let follow = AjaxAttributes.get(link, "follow", settings.followRedirects);
  let response = await request(link, targets, action, referrer, headers, follow);
  let history = AjaxAttributes.get(link, "history");
  let focus = AjaxAttributes.get(link, "focus", true);
  try {
    return await render(response, link, targets, history, focus);
  } catch (error) {
    if (error.name === "RenderError") {
      console.warn(error.message);
      window.location.href = link.href;
      return;
    }
    throw error;
  }
}
async function handleForms(event) {
  if (event.defaultPrevented) {
    return;
  }
  let form = event.target;
  let submitter = event.submitter;
  let method = ((submitter == null ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method") || "GET").toUpperCase();
  if (!form || !AjaxAttributes.has(form) || method === "DIALOG" || (submitter == null ? void 0 : submitter.hasAttribute("formnoajax")) || (submitter == null ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("noajax") || form.hasAttribute("target"))
    return;
  event.preventDefault();
  event.stopImmediatePropagation();
  let targets = addSyncTargets(findTargets(AjaxAttributes.get(form, "targets", [])));
  let referrer = source(form);
  let action = form.getAttribute("action") || referrer;
  let headers = AjaxAttributes.get(form, "headers", {});
  let follow = AjaxAttributes.get(form, "follow", settings.followRedirects);
  let body = new FormData(form);
  let enctype = form.getAttribute("enctype");
  if (submitter) {
    enctype = submitter.getAttribute("formenctype") || enctype;
    action = submitter.getAttribute("formaction") || action;
    if (submitter.name) {
      body.append(submitter.name, submitter.value);
    }
  }
  let response = await withSubmitter(submitter, () => {
    return request(form, targets, action, referrer, headers, follow, method, body, enctype);
  });
  let history = AjaxAttributes.get(form, "history");
  let focus = AjaxAttributes.get(form, "focus", true);
  try {
    return await render(response, form, targets, history, focus);
  } catch (error) {
    if (error.name === "RenderError") {
      console.warn(error.message);
      form.setAttribute("noajax", "true");
      form.requestSubmit(submitter);
      return;
    }
    throw error;
  }
}
function addGlobalListener(name, callback) {
  let callbackWithErrorHandler = async (event) => {
    try {
      await callback(event);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      throw error;
    }
  };
  let onCapture = () => {
    debug(`Event: "${name}" captured`);
    document.removeEventListener(name, callbackWithErrorHandler, false);
    document.addEventListener(name, callbackWithErrorHandler, false);
  };
  document.addEventListener(name, onCapture, true);
  return () => document.removeEventListener(name, onCapture, true);
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
var PendingTargets = {
  store: /* @__PURE__ */ new Map(),
  abort(id) {
    if (this.store.has(id)) {
      let request2 = this.store.get(id);
      request2.controller.abort();
      request2.target.removeAttribute("aria-busy");
    }
  },
  set(id, target, controller) {
    this.abort(id);
    target.querySelectorAll("[aria-busy]").forEach((busy) => this.abort(busy.getAttribute("id")));
    this.store.set(id, { target, controller });
    target.setAttribute("aria-busy", "true");
  }
};
var PendingRequests = /* @__PURE__ */ new Map();
async function request(el, targets, action, referrer, headers, follow, method = "GET", body = null, enctype = "application/x-www-form-urlencoded") {
  if (!dispatch(el, "ajax:before")) {
    debug(`Request cancelled`);
    throw new DOMException("[ajax:before] aborted", "AbortError");
  }
  debug("Requesting", arguments);
  let controller = new AbortController();
  let targetIds = [];
  targets.forEach((target) => {
    let id = target.getAttribute("id");
    PendingTargets.set(id, target, controller);
    targetIds.push(id);
  });
  let pending;
  if (method === "GET" && PendingRequests.has(action)) {
    pending = PendingRequests.get(action);
  } else {
    headers["X-Alpine-Target"] = targetIds.join("  ");
    headers["X-Alpine-Request"] = "true";
    headers = Object.assign({}, settings.headers, headers);
    if (body) {
      body = parseFormData(body);
      if (method === "GET") {
        action = mergeBodyIntoAction(body, action);
        body = null;
      } else if (enctype !== "multipart/form-data") {
        body = formDataToParams(body);
      }
    }
    pending = fetch(action, {
      method,
      headers,
      body,
      referrer,
      signal: controller.signal
    }).then((response2) => {
      if (!follow && response2.redirected) {
        window.location.href = response2.url;
      }
      return response2;
    }).then(async (response2) => {
      response2.html = await response2.text();
      return response2;
    });
    PendingRequests.set(action, pending);
  }
  let response = await pending;
  PendingRequests.delete(action);
  if (response.ok) {
    dispatch(el, "ajax:success", response);
  } else {
    dispatch(el, "ajax:error", response);
  }
  dispatch(el, "ajax:after", response);
  return response;
}
function parseFormData(data) {
  if (data instanceof FormData)
    return data;
  if (data instanceof HTMLFormElement)
    return new FormData(data);
  const formData = new FormData();
  for (let key in data) {
    if (typeof data[key] === "object") {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  }
  return formData;
}
function mergeBodyIntoAction(body, action) {
  action = new URL(action, document.baseURI);
  action.search = formDataToParams(body).toString();
  return action.toString();
}
function formDataToParams(body) {
  let params = Array.from(body.entries()).filter(([key, value]) => {
    return !(value instanceof File);
  });
  return new URLSearchParams(params);
}
async function render(response, el, targets, history, focus) {
  if (!response.html) {
    debug("No HTML in response");
    targets.forEach((target) => target.removeAttribute("aria-busy"));
    return;
  }
  debug("Rendering", arguments);
  if (history) {
    updateHistory(history, response.url);
  }
  let wrapper = document.createRange().createContextualFragment("<template>" + response.html + "</template>");
  let fragment = wrapper.firstElementChild.content;
  let focused = !focus;
  let renders = targets.map(async (target) => {
    let content = fragment.getElementById(target.getAttribute("id"));
    let strategy = AjaxAttributes.get(target, "strategy", settings.mergeStrategy);
    if (!content) {
      if (!dispatch(el, "ajax:missing", { target, response })) {
        return;
      }
      if (response.ok) {
        return target.remove();
      }
      throw new RenderError(target, response.status);
    }
    let mergeContent = async () => {
      let merged = await merge(strategy, target, content);
      if (merged) {
        merged.dataset.source = response.url;
        merged.removeAttribute("aria-busy");
        let focusables = ["[x-autofocus]", "[autofocus]"];
        focusables.some((selector) => {
          if (focused)
            return true;
          if (merged.matches(selector)) {
            focused = focusOn(merged);
          }
          return focused || Array.from(merged.querySelectorAll(selector)).some((focusable) => focusOn(focusable));
        });
      }
      dispatch(merged, "ajax:merged");
      return merged;
    };
    if (!dispatch(target, "ajax:merge", { strategy, content, merge: mergeContent })) {
      return;
    }
    return mergeContent();
  });
  return await Promise.all(renders);
}
async function merge(strategy, from, to) {
  let strategies = {
    before(from2, to2) {
      from2.before(...to2.childNodes);
      return from2;
    },
    replace(from2, to2) {
      from2.replaceWith(to2);
      return to2;
    },
    update(from2, to2) {
      from2.replaceChildren(...to2.childNodes);
      return from2;
    },
    prepend(from2, to2) {
      from2.prepend(...to2.childNodes);
      return from2;
    },
    append(from2, to2) {
      from2.append(...to2.childNodes);
      return from2;
    },
    after(from2, to2) {
      from2.after(...to2.childNodes);
      return from2;
    },
    morph(from2, to2) {
      doMorph(from2, to2);
      return document.getElementById(to2.getAttribute("id"));
    }
  };
  if (!AjaxAttributes.get(from, "transition") || !document.startViewTransition) {
    return strategies[strategy](from, to);
  }
  let merged = null;
  let transition = document.startViewTransition(() => {
    merged = strategies[strategy](from, to);
    return Promise.resolve();
  });
  await transition.updateCallbackDone;
  return merged;
}
function focusOn(el) {
  if (!el)
    return false;
  if (!el.getClientRects().length)
    return false;
  setTimeout(() => {
    if (!el.hasAttribute("tabindex"))
      el.setAttribute("tabindex", "0");
    el.focus();
  }, 0);
  return true;
}
function updateHistory(strategy, url) {
  let strategies = {
    push: () => window.history.pushState({ __ajax: true }, "", url),
    replace: () => window.history.replaceState({ __ajax: true }, "", url)
  };
  return strategies[strategy]();
}
function parseTargetIds(el, target = null) {
  let ids = [el.getAttribute("id")];
  if (target) {
    ids = Array.isArray(target) ? target : target.split(" ");
  }
  ids = ids.filter((id) => id);
  if (ids.length === 0) {
    throw new IDError(el);
  }
  return ids;
}
function findTargets(ids = []) {
  return ids.map((id) => {
    let target = document.getElementById(id);
    if (!target) {
      throw new TargetError(id);
    }
    return target;
  });
}
function addSyncTargets(targets) {
  document.querySelectorAll("[x-sync]").forEach((el) => {
    let id = el.getAttribute("id");
    if (!id) {
      throw new IdNotFoundError(el);
    }
    if (!targets.some((target) => target.getAttribute("id") === id)) {
      targets.push(el);
    }
  });
  return targets;
}
function source(el) {
  var _a;
  return ((_a = el.closest("[data-source]")) == null ? void 0 : _a.dataset.source) || window.location.href;
}
function dispatch(el, name, detail) {
  return el.dispatchEvent(
    new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true
    })
  );
}
var IDError = class extends DOMException {
  constructor(el) {
    var _a, _b;
    let description = (_b = ((_a = el.outerHTML.match(/<[^>]+>/)) != null ? _a : [])[0]) != null ? _b : "[Element]";
    super(`${description} is missing an ID to target.`, "IDError");
  }
};
var TargetError = class extends DOMException {
  constructor(id) {
    super(`[#${id}] was not found in the current document.`, "TargetError");
  }
};
var RenderError = class extends DOMException {
  constructor(target, status) {
    let id = target.getAttribute("id");
    super(`Target [#${id}] was not found in response with status [${status}].`, "RenderError");
  }
};

// builds/module.js
var module_default = src_default;

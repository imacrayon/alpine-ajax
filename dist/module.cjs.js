var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@alpinejs/morph/dist/module.cjs.js
var require_module_cjs = __commonJS({
  "node_modules/@alpinejs/morph/dist/module.cjs.js"(exports, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var module_exports2 = {};
    __export2(module_exports2, {
      default: () => module_default2,
      morph: () => morph
    });
    module2.exports = __toCommonJS2(module_exports2);
    function morph(from, toHtml, options) {
      monkeyPatchDomSetAttributeToAllowAtSymbols();
      let fromEl;
      let toEl;
      let key, lookahead, updating, updated, removing, removed, adding, added;
      function assignOptions(options2 = {}) {
        let defaultGetKey = (el) => el.getAttribute("key");
        let noop = () => {
        };
        updating = options2.updating || noop;
        updated = options2.updated || noop;
        removing = options2.removing || noop;
        removed = options2.removed || noop;
        adding = options2.adding || noop;
        added = options2.added || noop;
        key = options2.key || defaultGetKey;
        lookahead = options2.lookahead || false;
      }
      function patch(from2, to) {
        if (differentElementNamesTypesOrKeys(from2, to)) {
          return swapElements(from2, to);
        }
        let updateChildrenOnly = false;
        if (shouldSkip(updating, from2, to, () => updateChildrenOnly = true))
          return;
        if (from2.nodeType === 1 && window.Alpine) {
          window.Alpine.cloneNode(from2, to);
        }
        if (textOrComment(to)) {
          patchNodeValue(from2, to);
          updated(from2, to);
          return;
        }
        if (!updateChildrenOnly) {
          patchAttributes(from2, to);
        }
        updated(from2, to);
        patchChildren(from2, to);
      }
      function differentElementNamesTypesOrKeys(from2, to) {
        return from2.nodeType != to.nodeType || from2.nodeName != to.nodeName || getKey(from2) != getKey(to);
      }
      function swapElements(from2, to) {
        if (shouldSkip(removing, from2))
          return;
        let toCloned = to.cloneNode(true);
        if (shouldSkip(adding, toCloned))
          return;
        from2.replaceWith(toCloned);
        removed(from2);
        added(toCloned);
      }
      function patchNodeValue(from2, to) {
        let value = to.nodeValue;
        if (from2.nodeValue !== value) {
          from2.nodeValue = value;
        }
      }
      function patchAttributes(from2, to) {
        if (from2._x_transitioning)
          return;
        if (from2._x_isShown && !to._x_isShown) {
          return;
        }
        if (!from2._x_isShown && to._x_isShown) {
          return;
        }
        let domAttributes = Array.from(from2.attributes);
        let toAttributes = Array.from(to.attributes);
        for (let i = domAttributes.length - 1; i >= 0; i--) {
          let name = domAttributes[i].name;
          if (!to.hasAttribute(name)) {
            from2.removeAttribute(name);
          }
        }
        for (let i = toAttributes.length - 1; i >= 0; i--) {
          let name = toAttributes[i].name;
          let value = toAttributes[i].value;
          if (from2.getAttribute(name) !== value) {
            from2.setAttribute(name, value);
          }
        }
      }
      function patchChildren(from2, to) {
        let fromKeys = keyToMap(from2.children);
        let fromKeyHoldovers = {};
        let currentTo = getFirstNode(to);
        let currentFrom = getFirstNode(from2);
        while (currentTo) {
          let toKey = getKey(currentTo);
          let fromKey = getKey(currentFrom);
          if (!currentFrom) {
            if (toKey && fromKeyHoldovers[toKey]) {
              let holdover = fromKeyHoldovers[toKey];
              from2.appendChild(holdover);
              currentFrom = holdover;
            } else {
              if (!shouldSkip(adding, currentTo)) {
                let clone = currentTo.cloneNode(true);
                from2.appendChild(clone);
                added(clone);
              }
              currentTo = getNextSibling(to, currentTo);
              continue;
            }
          }
          let isIf = (node) => node && node.nodeType === 8 && node.textContent === " __BLOCK__ ";
          let isEnd = (node) => node && node.nodeType === 8 && node.textContent === " __ENDBLOCK__ ";
          if (isIf(currentTo) && isIf(currentFrom)) {
            let nestedIfCount = 0;
            let fromBlockStart = currentFrom;
            while (currentFrom) {
              let next = getNextSibling(from2, currentFrom);
              if (isIf(next)) {
                nestedIfCount++;
              } else if (isEnd(next) && nestedIfCount > 0) {
                nestedIfCount--;
              } else if (isEnd(next) && nestedIfCount === 0) {
                currentFrom = next;
                break;
              }
              currentFrom = next;
            }
            let fromBlockEnd = currentFrom;
            nestedIfCount = 0;
            let toBlockStart = currentTo;
            while (currentTo) {
              let next = getNextSibling(to, currentTo);
              if (isIf(next)) {
                nestedIfCount++;
              } else if (isEnd(next) && nestedIfCount > 0) {
                nestedIfCount--;
              } else if (isEnd(next) && nestedIfCount === 0) {
                currentTo = next;
                break;
              }
              currentTo = next;
            }
            let toBlockEnd = currentTo;
            let fromBlock = new Block(fromBlockStart, fromBlockEnd);
            let toBlock = new Block(toBlockStart, toBlockEnd);
            patchChildren(fromBlock, toBlock);
            continue;
          }
          if (currentFrom.nodeType === 1 && lookahead && !currentFrom.isEqualNode(currentTo)) {
            let nextToElementSibling = getNextSibling(to, currentTo);
            let found = false;
            while (!found && nextToElementSibling) {
              if (nextToElementSibling.nodeType === 1 && currentFrom.isEqualNode(nextToElementSibling)) {
                found = true;
                currentFrom = addNodeBefore(from2, currentTo, currentFrom);
                fromKey = getKey(currentFrom);
              }
              nextToElementSibling = getNextSibling(to, nextToElementSibling);
            }
          }
          if (toKey !== fromKey) {
            if (!toKey && fromKey) {
              fromKeyHoldovers[fromKey] = currentFrom;
              currentFrom = addNodeBefore(from2, currentTo, currentFrom);
              fromKeyHoldovers[fromKey].remove();
              currentFrom = getNextSibling(from2, currentFrom);
              currentTo = getNextSibling(to, currentTo);
              continue;
            }
            if (toKey && !fromKey) {
              if (fromKeys[toKey]) {
                currentFrom.replaceWith(fromKeys[toKey]);
                currentFrom = fromKeys[toKey];
              }
            }
            if (toKey && fromKey) {
              let fromKeyNode = fromKeys[toKey];
              if (fromKeyNode) {
                fromKeyHoldovers[fromKey] = currentFrom;
                currentFrom.replaceWith(fromKeyNode);
                currentFrom = fromKeyNode;
              } else {
                fromKeyHoldovers[fromKey] = currentFrom;
                currentFrom = addNodeBefore(from2, currentTo, currentFrom);
                fromKeyHoldovers[fromKey].remove();
                currentFrom = getNextSibling(from2, currentFrom);
                currentTo = getNextSibling(to, currentTo);
                continue;
              }
            }
          }
          let currentFromNext = currentFrom && getNextSibling(from2, currentFrom);
          patch(currentFrom, currentTo);
          currentTo = currentTo && getNextSibling(to, currentTo);
          currentFrom = currentFromNext;
        }
        let removals = [];
        while (currentFrom) {
          if (!shouldSkip(removing, currentFrom))
            removals.push(currentFrom);
          currentFrom = getNextSibling(from2, currentFrom);
        }
        while (removals.length) {
          let domForRemoval = removals.shift();
          domForRemoval.remove();
          removed(domForRemoval);
        }
      }
      function getKey(el) {
        return el && el.nodeType === 1 && key(el);
      }
      function keyToMap(els) {
        let map = {};
        for (let el of els) {
          let theKey = getKey(el);
          if (theKey) {
            map[theKey] = el;
          }
        }
        return map;
      }
      function addNodeBefore(parent, node, beforeMe) {
        if (!shouldSkip(adding, node)) {
          let clone = node.cloneNode(true);
          parent.insertBefore(clone, beforeMe);
          added(clone);
          return clone;
        }
        return node;
      }
      assignOptions(options);
      fromEl = from;
      toEl = typeof toHtml === "string" ? createElement(toHtml) : toHtml;
      if (window.Alpine && window.Alpine.closestDataStack && !from._x_dataStack) {
        toEl._x_dataStack = window.Alpine.closestDataStack(from);
        toEl._x_dataStack && window.Alpine.cloneNode(from, toEl);
      }
      patch(from, toEl);
      fromEl = void 0;
      toEl = void 0;
      return from;
    }
    morph.step = () => {
    };
    morph.log = () => {
    };
    function shouldSkip(hook, ...args) {
      let skip = false;
      hook(...args, () => skip = true);
      return skip;
    }
    var patched = false;
    function createElement(html) {
      const template = document.createElement("template");
      template.innerHTML = html;
      return template.content.firstElementChild;
    }
    function textOrComment(el) {
      return el.nodeType === 3 || el.nodeType === 8;
    }
    var Block = class {
      constructor(start, end) {
        this.startComment = start;
        this.endComment = end;
      }
      get children() {
        let children = [];
        let currentNode = this.startComment.nextSibling;
        while (currentNode !== void 0 && currentNode !== this.endComment) {
          children.push(currentNode);
          currentNode = currentNode.nextSibling;
        }
        return children;
      }
      appendChild(child) {
        this.endComment.before(child);
      }
      get firstChild() {
        let first = this.startComment.nextSibling;
        if (first === this.endComment)
          return;
        return first;
      }
      nextNode(reference) {
        let next = reference.nextSibling;
        if (next === this.endComment)
          return;
        return next;
      }
      insertBefore(newNode, reference) {
        reference.before(newNode);
        return newNode;
      }
    };
    function getFirstNode(parent) {
      return parent.firstChild;
    }
    function getNextSibling(parent, reference) {
      if (reference._x_teleport) {
        return reference._x_teleport;
      } else if (reference.teleportBack) {
        return reference.teleportBack;
      }
      let next;
      if (parent instanceof Block) {
        next = parent.nextNode(reference);
      } else {
        next = reference.nextSibling;
      }
      return next;
    }
    function monkeyPatchDomSetAttributeToAllowAtSymbols() {
      if (patched)
        return;
      patched = true;
      let original = Element.prototype.setAttribute;
      let hostDiv = document.createElement("div");
      Element.prototype.setAttribute = function newSetAttribute(name, value) {
        if (!name.includes("@")) {
          return original.call(this, name, value);
        }
        hostDiv.innerHTML = `<span ${name}="${value}"></span>`;
        let attr = hostDiv.firstElementChild.getAttributeNode(name);
        hostDiv.firstElementChild.removeAttributeNode(attr);
        this.setAttributeNode(attr);
      };
    }
    function src_default2(Alpine) {
      Alpine.morph = morph;
    }
    var module_default2 = src_default2;
  }
});

// builds/module.js
var module_exports = {};
__export(module_exports, {
  default: () => module_default
});
module.exports = __toCommonJS(module_exports);

// src/helpers.js
var configuration = {
  followRedirects: false,
  mergeStrategy: "replace"
};
function parseIds(el, expression = "") {
  let ids = expression ? expression.split(" ") : [el.id];
  if (ids.length === 0) {
    throw new MissingIdError(el);
  }
  return ids;
}
function getTargets(ids = []) {
  ids = ids.filter((id) => id);
  return ids.map((id) => {
    let target = document.getElementById(id);
    if (!target) {
      throw new MissingTargetError(id);
    }
    return target;
  });
}
function addSyncTargets(targets) {
  document.querySelectorAll("[x-sync]").forEach((el) => {
    if (!el.id) {
      throw new MissingIdError(el);
    }
    if (!targets.some((target) => target.id === el.id)) {
      targets.push(el);
    }
  });
  return targets;
}
var MissingIdError = class extends Error {
  constructor(el) {
    var _a, _b;
    let description = (_b = ((_a = el.outerHTML.match(/<[^>]+>/)) != null ? _a : [])[0]) != null ? _b : "[Element]";
    super(`${description} is missing an ID to target.`);
    this.name = "Target Missing ID";
  }
};
var MissingTargetError = class extends Error {
  constructor(id) {
    super(`#${id} was not found in the current document.`);
    this.name = "Missing Target";
  }
};
var FailedResponseError = class extends Error {
  constructor(el) {
    var _a, _b;
    let description = (_b = ((_a = el.outerHTML.match(/<[^>]+>/)) != null ? _a : [])[0]) != null ? _b : "[Element]";
    super(`${description} received a failed response.`);
    this.name = "Failed Response";
  }
};
function source(el) {
  var _a;
  return (_a = el.closest("[data-source]")) == null ? void 0 : _a.dataset.source;
}

// src/render.js
var import_morph = __toESM(require_module_cjs());
var queue = {};
var merge = {
  before(from, to) {
    from.before(...to.childNodes);
    return from;
  },
  replace(from, to) {
    from.replaceWith(to);
    return to;
  },
  update(from, to) {
    from.replaceChildren(...to.childNodes);
    return from;
  },
  prepend(from, to) {
    from.prepend(...to.childNodes);
    return from;
  },
  append(from, to) {
    from.append(...to.childNodes);
    return from;
  },
  after(from, to) {
    from.after(...to.childNodes);
    return from;
  },
  morph(from, to) {
    (0, import_morph.morph)(from, to);
    return document.getElementById(to.id);
  }
};
async function render(request, targets, el, events = true) {
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
  targets.forEach((target) => {
    target.setAttribute("aria-busy", "true");
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
  targets = targets.map((target) => {
    let template = fragment.getElementById(target.id);
    let strategy = target.getAttribute("x-merge") || configuration.mergeStrategy;
    if (!template) {
      if (!dispatch("ajax:missing", response)) {
        return;
      }
      if (!target.hasAttribute("x-sync")) {
        console.warn(`Target #${target.id} not found in AJAX response.`);
      }
      if (response.ok) {
        return renderElement(strategy, target, target.cloneNode(false));
      }
      throw new FailedResponseError(el);
    }
    let freshEl = renderElement(strategy, target, template);
    if (freshEl) {
      freshEl.removeAttribute("aria-busy");
      freshEl.dataset.source = response.url;
    }
    return freshEl;
  });
  let focus = el.getAttribute("x-focus");
  if (focus) {
    focusOn(document.getElementById(focus));
  }
  return targets;
}
function renderElement(strategy, from, to) {
  return merge[strategy](from, to);
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
  }).then(handleRedirect).then(readHtml).then(onSuccess).catch(onError);
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
function handleRedirect(response) {
  if (response.redirected && !configuration.followRedirects) {
    window.location.href = response.url;
    return;
  }
  return response;
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
function listenForNavigate(el, targetIds) {
  let handler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    let targets = addSyncTargets(getTargets(targetIds));
    let link = event.target;
    let request = navigateRequest(link);
    try {
      return await render(request, targets, link);
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
function listenForSubmit(el, targetIds) {
  let handler = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    let targets = addSyncTargets(getTargets(targetIds));
    let form = event.target;
    let request = formRequest(form, event.submitter);
    try {
      return await withSubmitter(event.submitter, () => {
        return render(request, targets, form);
      });
    } catch (error) {
      if (error instanceof FailedResponseError) {
        console.warn(error.message);
        form.removeEventListener("submit", handler);
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
  return (candidate == null ? void 0 : candidate.type) == "submit" ? candidate : null;
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
function src_default(Alpine) {
  Alpine.directive("target", (el, { expression }, { cleanup }) => {
    let ids = parseIds(el, expression);
    let stopListening = isLocalLink(el) ? listenForNavigate(el, ids) : listenForSubmit(el, ids);
    cleanup(stopListening);
  });
  Alpine.magic("ajax", (el) => {
    return (action, options = {}) => {
      let ids = options.target ? options.target.split(" ") : parseIds(el);
      let targets = getTargets(ids);
      targets = options.sync ? addSyncTargets(targets) : targets;
      let method = options.method ? options.method.toUpperCase() : "GET";
      let body = null;
      if (options.body) {
        if (options.body instanceof HTMLFormElement) {
          body = new FormData(options.body);
        } else {
          body = new FormData();
          for (let key in options.body) {
            body.append(key, options.body[key]);
          }
        }
        if (method === "GET") {
          action = mergeBodyIntoAction(body, action);
          body = null;
        }
      }
      let request = {
        action,
        method,
        body,
        referrer: source(el)
      };
      return render(request, targets, el, Boolean(options.events));
    };
  });
}

// builds/module.js
var module_default = src_default;

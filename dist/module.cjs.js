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

// node_modules/tabbable/dist/index.js
var require_dist = __commonJS({
  "node_modules/tabbable/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var candidateSelectors = ["input:not([inert])", "select:not([inert])", "textarea:not([inert])", "a[href]:not([inert])", "button:not([inert])", "[tabindex]:not(slot):not([inert])", "audio[controls]:not([inert])", "video[controls]:not([inert])", '[contenteditable]:not([contenteditable="false"]):not([inert])', "details>summary:first-of-type:not([inert])", "details:not([inert])"];
    var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
    var NoElement = typeof Element === "undefined";
    var matches = NoElement ? function() {
    } : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
      var _element$getRootNode;
      return element === null || element === void 0 ? void 0 : (_element$getRootNode = element.getRootNode) === null || _element$getRootNode === void 0 ? void 0 : _element$getRootNode.call(element);
    } : function(element) {
      return element === null || element === void 0 ? void 0 : element.ownerDocument;
    };
    var isInert = function isInert2(node, lookUp) {
      var _node$getAttribute;
      if (lookUp === void 0) {
        lookUp = true;
      }
      var inertAtt = node === null || node === void 0 ? void 0 : (_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, "inert");
      var inert = inertAtt === "" || inertAtt === "true";
      var result = inert || lookUp && node && isInert2(node.parentNode);
      return result;
    };
    var isContentEditable = function isContentEditable2(node) {
      var _node$getAttribute2;
      var attValue = node === null || node === void 0 ? void 0 : (_node$getAttribute2 = node.getAttribute) === null || _node$getAttribute2 === void 0 ? void 0 : _node$getAttribute2.call(node, "contenteditable");
      return attValue === "" || attValue === "true";
    };
    var getCandidates = function getCandidates2(el, includeContainer, filter) {
      if (isInert(el)) {
        return [];
      }
      var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
      if (includeContainer && matches.call(el, candidateSelector)) {
        candidates.unshift(el);
      }
      candidates = candidates.filter(filter);
      return candidates;
    };
    var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
      var candidates = [];
      var elementsToCheck = Array.from(elements);
      while (elementsToCheck.length) {
        var element = elementsToCheck.shift();
        if (isInert(element, false)) {
          continue;
        }
        if (element.tagName === "SLOT") {
          var assigned = element.assignedElements();
          var content = assigned.length ? assigned : element.children;
          var nestedCandidates = getCandidatesIteratively2(content, true, options);
          if (options.flatten) {
            candidates.push.apply(candidates, nestedCandidates);
          } else {
            candidates.push({
              scopeParent: element,
              candidates: nestedCandidates
            });
          }
        } else {
          var validCandidate = matches.call(element, candidateSelector);
          if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
            candidates.push(element);
          }
          var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
          typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
          var validShadowRoot = !isInert(shadowRoot, false) && (!options.shadowRootFilter || options.shadowRootFilter(element));
          if (shadowRoot && validShadowRoot) {
            var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
            if (options.flatten) {
              candidates.push.apply(candidates, _nestedCandidates);
            } else {
              candidates.push({
                scopeParent: element,
                candidates: _nestedCandidates
              });
            }
          } else {
            elementsToCheck.unshift.apply(elementsToCheck, element.children);
          }
        }
      }
      return candidates;
    };
    var getTabindex = function getTabindex2(node, isScope) {
      if (node.tabIndex < 0) {
        if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || isContentEditable(node)) && isNaN(parseInt(node.getAttribute("tabindex"), 10))) {
          return 0;
        }
      }
      return node.tabIndex;
    };
    var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
      return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
    };
    var isInput = function isInput2(node) {
      return node.tagName === "INPUT";
    };
    var isHiddenInput = function isHiddenInput2(node) {
      return isInput(node) && node.type === "hidden";
    };
    var isDetailsWithSummary = function isDetailsWithSummary2(node) {
      var r = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
        return child.tagName === "SUMMARY";
      });
      return r;
    };
    var getCheckedRadio = function getCheckedRadio2(nodes, form) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checked && nodes[i].form === form) {
          return nodes[i];
        }
      }
    };
    var isTabbableRadio = function isTabbableRadio2(node) {
      if (!node.name) {
        return true;
      }
      var radioScope = node.form || getRootNode(node);
      var queryRadios = function queryRadios2(name) {
        return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
      };
      var radioSet;
      if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
        radioSet = queryRadios(window.CSS.escape(node.name));
      } else {
        try {
          radioSet = queryRadios(node.name);
        } catch (err) {
          console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
          return false;
        }
      }
      var checked = getCheckedRadio(radioSet, node.form);
      return !checked || checked === node;
    };
    var isRadio = function isRadio2(node) {
      return isInput(node) && node.type === "radio";
    };
    var isNonTabbableRadio = function isNonTabbableRadio2(node) {
      return isRadio(node) && !isTabbableRadio(node);
    };
    var isNodeAttached = function isNodeAttached2(node) {
      var _nodeRoot;
      var nodeRoot = node && getRootNode(node);
      var nodeRootHost = (_nodeRoot = nodeRoot) === null || _nodeRoot === void 0 ? void 0 : _nodeRoot.host;
      var attached = false;
      if (nodeRoot && nodeRoot !== node) {
        var _nodeRootHost, _nodeRootHost$ownerDo, _node$ownerDocument;
        attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && (_nodeRootHost$ownerDo = _nodeRootHost.ownerDocument) !== null && _nodeRootHost$ownerDo !== void 0 && _nodeRootHost$ownerDo.contains(nodeRootHost) || node !== null && node !== void 0 && (_node$ownerDocument = node.ownerDocument) !== null && _node$ownerDocument !== void 0 && _node$ownerDocument.contains(node));
        while (!attached && nodeRootHost) {
          var _nodeRoot2, _nodeRootHost2, _nodeRootHost2$ownerD;
          nodeRoot = getRootNode(nodeRootHost);
          nodeRootHost = (_nodeRoot2 = nodeRoot) === null || _nodeRoot2 === void 0 ? void 0 : _nodeRoot2.host;
          attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && (_nodeRootHost2$ownerD = _nodeRootHost2.ownerDocument) !== null && _nodeRootHost2$ownerD !== void 0 && _nodeRootHost2$ownerD.contains(nodeRootHost));
        }
      }
      return attached;
    };
    var isZeroArea = function isZeroArea2(node) {
      var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
      return width === 0 && height === 0;
    };
    var isHidden = function isHidden2(node, _ref) {
      var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
      if (getComputedStyle(node).visibility === "hidden") {
        return true;
      }
      var isDirectSummary = matches.call(node, "details>summary:first-of-type");
      var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
      if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
        return true;
      }
      if (!displayCheck || displayCheck === "full" || displayCheck === "legacy-full") {
        if (typeof getShadowRoot === "function") {
          var originalNode = node;
          while (node) {
            var parentElement = node.parentElement;
            var rootNode = getRootNode(node);
            if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
              return isZeroArea(node);
            } else if (node.assignedSlot) {
              node = node.assignedSlot;
            } else if (!parentElement && rootNode !== node.ownerDocument) {
              node = rootNode.host;
            } else {
              node = parentElement;
            }
          }
          node = originalNode;
        }
        if (isNodeAttached(node)) {
          return !node.getClientRects().length;
        }
        if (displayCheck !== "legacy-full") {
          return true;
        }
      } else if (displayCheck === "non-zero-area") {
        return isZeroArea(node);
      }
      return false;
    };
    var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
      if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
        var parentNode = node.parentElement;
        while (parentNode) {
          if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
            for (var i = 0; i < parentNode.children.length; i++) {
              var child = parentNode.children.item(i);
              if (child.tagName === "LEGEND") {
                return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
              }
            }
            return true;
          }
          parentNode = parentNode.parentElement;
        }
      }
      return false;
    };
    var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
      if (node.disabled || // we must do an inert look up to filter out any elements inside an inert ancestor
      //  because we're limited in the type of selectors we can use in JSDom (see related
      //  note related to `candidateSelectors`)
      isInert(node) || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
      isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
        return false;
      }
      return true;
    };
    var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
      if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
        return false;
      }
      return true;
    };
    var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
      var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
      if (isNaN(tabIndex) || tabIndex >= 0) {
        return true;
      }
      return false;
    };
    var sortByOrder = function sortByOrder2(candidates) {
      var regularTabbables = [];
      var orderedTabbables = [];
      candidates.forEach(function(item, i) {
        var isScope = !!item.scopeParent;
        var element = isScope ? item.scopeParent : item;
        var candidateTabindex = getTabindex(element, isScope);
        var elements = isScope ? sortByOrder2(item.candidates) : element;
        if (candidateTabindex === 0) {
          isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
        } else {
          orderedTabbables.push({
            documentOrder: i,
            tabIndex: candidateTabindex,
            item,
            isScope,
            content: elements
          });
        }
      });
      return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
        sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
        return acc;
      }, []).concat(regularTabbables);
    };
    var tabbable = function tabbable2(el, options) {
      options = options || {};
      var candidates;
      if (options.getShadowRoot) {
        candidates = getCandidatesIteratively([el], options.includeContainer, {
          filter: isNodeMatchingSelectorTabbable.bind(null, options),
          flatten: false,
          getShadowRoot: options.getShadowRoot,
          shadowRootFilter: isValidShadowRootTabbable
        });
      } else {
        candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
      }
      return sortByOrder(candidates);
    };
    var focusable2 = function focusable3(el, options) {
      options = options || {};
      var candidates;
      if (options.getShadowRoot) {
        candidates = getCandidatesIteratively([el], options.includeContainer, {
          filter: isNodeMatchingSelectorFocusable.bind(null, options),
          flatten: true,
          getShadowRoot: options.getShadowRoot
        });
      } else {
        candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
      }
      return candidates;
    };
    var isTabbable = function isTabbable2(node, options) {
      options = options || {};
      if (!node) {
        throw new Error("No node provided");
      }
      if (matches.call(node, candidateSelector) === false) {
        return false;
      }
      return isNodeMatchingSelectorTabbable(options, node);
    };
    var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
    var isFocusable = function isFocusable2(node, options) {
      options = options || {};
      if (!node) {
        throw new Error("No node provided");
      }
      if (matches.call(node, focusableCandidateSelector) === false) {
        return false;
      }
      return isNodeMatchingSelectorFocusable(options, node);
    };
    exports.focusable = focusable2;
    exports.isFocusable = isFocusable;
    exports.isTabbable = isTabbable;
    exports.tabbable = tabbable;
  }
});

// builds/module.js
var module_exports = {};
__export(module_exports, {
  default: () => module_default
});
module.exports = __toCommonJS(module_exports);

// src/helpers.js
var Alpine;
function setAlpine(alpine) {
  Alpine = alpine;
}
function targets(root, sync = false, trigger = null) {
  let ids = [];
  if (trigger && trigger.hasAttribute("target")) {
    ids = trigger.getAttribute("target").split(" ");
  } else if (root.hasAttribute("target")) {
    ids = root.getAttribute("target").split(" ");
  } else {
    ids = [root.id];
  }
  ids = ids.filter((id) => id);
  if (ids.length === 0) {
    throw new MissingIdError(root);
  }
  if (sync) {
    document.querySelectorAll("[x-sync]").forEach((el) => {
      if (!el.id) {
        throw new MissingIdError(el);
      }
      if (!ids.includes(el.id)) {
        ids.push(el.id);
      }
    });
  }
  return ids;
}
function isIgnored(el) {
  let root = el.closest("[x-ajax],[noajax]");
  return root.hasAttribute("noajax");
}
var MissingIdError = class extends Error {
  constructor(el) {
    var _a, _b;
    let description = (_b = ((_a = el.outerHTML.match(/<[^>]+>/)) != null ? _a : [])[0]) != null ? _b : "[Element]";
    super(`${description} is missing an ID to target.`);
    this.name = "Target Missing ID";
  }
};
function source(el) {
  var _a;
  return (_a = el.closest("[data-source]")) == null ? void 0 : _a.dataset.source;
}

// src/render.js
var import_tabbable = __toESM(require_dist());
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
      return window.location.href = response.url;
    }
    renderElement(target, template);
    let freshEl = document.getElementById(id);
    freshEl.dataset.source = response.url;
    return freshEl;
  });
  let initialFocus = Alpine.bound(el, "initial-focus");
  if (initialFocus !== void 0 && initialFocus !== "false") {
    setTimeout(() => {
      Alpine.bound(el, "initial-focus").focus();
    }, 0);
  } else if (targets2.length) {
    focusFirstElement(targets2[0]);
  }
  return targets2;
}
async function send({ method, action, body: body2, referrer }) {
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
    body: body2
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
function focusFirstElement(el) {
  var _a;
  let focusables = (0, import_tabbable.focusable)(el, { displayCheck: "none" });
  let focus = (_a = focusables[0]) != null ? _a : null;
  if (!focus) {
    return;
  }
  setTimeout(() => {
    if (!focus.hasAttribute("tabindex"))
      focus.setAttribute("tabindex", "0");
    focus.focus();
  }, 0);
}

// src/link.js
function listenForNavigate(el) {
  let handler = (event) => {
    let link = event.target;
    if (!isLocalLink(link) || isIgnored(link))
      return;
    event.preventDefault();
    event.stopPropagation();
    render(navigateRequest(link), targets(el, true, link), link);
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
  let handler = (event) => {
    let form = event.target;
    if (isIgnored(form))
      return;
    event.preventDefault();
    event.stopPropagation();
    return withSubmitter(event.submitter, () => {
      return render(formRequest(form, event.submitter), targets(el, true, form), form);
    });
  };
  el.addEventListener("submit", handler);
  return () => el.removeEventListener("submit", handler);
}
function formRequest(form, submitter = null) {
  var _a;
  let method = (form.getAttribute("method") || "GET").toUpperCase();
  let action = form.getAttribute("action") || window.location.href;
  let body2 = new FormData(form);
  if (method === "GET") {
    action = mergeBodyIntoAction(body2, action);
    body2 = null;
  }
  if (submitter && submitter.name) {
    body2.append(submitter.name, submitter.value);
  }
  let referrer = (_a = form.closest("[data-source]")) == null ? void 0 : _a.dataset.source;
  return { method, action, body: body2, referrer };
}
async function withSubmitter(submitter, callback) {
  if (!submitter)
    return await callback();
  let disableEvent = (e) => e.preventDefault();
  submitter.setAttribute("aria-disabled", "true");
  submitter.addEventListener("click", disableEvent);
  let focus = submitter === document.activeElement;
  let result = await callback();
  submitter.removeAttribute("aria-disabled");
  submitter.removeEventListener("click", disableEvent);
  return result;
}
function mergeBodyIntoAction(body2, action) {
  let params = Array.from(body2.entries()).filter(([key, value]) => value !== "" || value !== null);
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

// src/submitter-polyfill.js
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
      let request = {
        action,
        method: (options == null ? void 0 : options.method) ? options.method.toUpperCase() : "GET",
        body: (options == null ? void 0 : options.body) ? new FormData(body) : null,
        referrer: source(el)
      };
      return render(request, targets(el, options == null ? void 0 : options.sync), el, Boolean(options == null ? void 0 : options.events));
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*! Bundled license information:

tabbable/dist/index.js:
  (*!
  * tabbable 6.1.1
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  *)
*/

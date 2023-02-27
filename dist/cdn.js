(() => {
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
      let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "[Element]";
      super(`${description} is missing an ID to target.`);
      this.name = "Target Missing ID";
    }
  };
  function source(el) {
    return el.closest("[data-source]")?.dataset.source;
  }

  // node_modules/tabbable/dist/index.esm.js
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
  var focusable = function focusable2(el, options) {
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
    let focusables = focusable(el, { displayCheck: "none" });
    let focus = focusables[0] ?? null;
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
    let referrer = form.closest("[data-source]")?.dataset.source;
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
          method: options?.method ? options.method.toUpperCase() : "GET",
          body: options?.body ? new FormData(body) : null,
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

  // builds/cdn.js
  document.addEventListener("alpine:initializing", () => {
    src_default(window.Alpine);
  });
})();
/*! Bundled license information:

tabbable/dist/index.esm.js:
  (*!
  * tabbable 6.1.1
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  *)
*/

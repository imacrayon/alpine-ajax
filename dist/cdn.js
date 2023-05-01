(() => {
  // src/helpers.js
  function targetRoot(el) {
    return el.closest("[x-target],[x-ajax]");
  }
  function targets(el, sync = false) {
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

  // node_modules/@alpinejs/morph/dist/module.esm.js
  function createElement(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstElementChild;
  }
  function textOrComment(el) {
    return el.nodeType === 3 || el.nodeType === 8;
  }
  var dom = {
    replace(children, old, replacement) {
      let index = children.indexOf(old);
      if (index === -1)
        throw "Cant find element in children";
      old.replaceWith(replacement);
      children[index] = replacement;
      return children;
    },
    before(children, reference, subject) {
      let index = children.indexOf(reference);
      if (index === -1)
        throw "Cant find element in children";
      reference.before(subject);
      children.splice(index, 0, subject);
      return children;
    },
    append(children, subject, appendFn) {
      let last = children[children.length - 1];
      appendFn(subject);
      children.push(subject);
      return children;
    },
    remove(children, subject) {
      let index = children.indexOf(subject);
      if (index === -1)
        throw "Cant find element in children";
      subject.remove();
      return children.filter((i) => i !== subject);
    },
    first(children) {
      return this.teleportTo(children[0]);
    },
    next(children, reference) {
      let index = children.indexOf(reference);
      if (index === -1)
        return;
      return this.teleportTo(this.teleportBack(children[index + 1]));
    },
    teleportTo(el) {
      if (!el)
        return el;
      if (el._x_teleport)
        return el._x_teleport;
      return el;
    },
    teleportBack(el) {
      if (!el)
        return el;
      if (el._x_teleportBack)
        return el._x_teleportBack;
      return el;
    }
  };
  var resolveStep = () => {
  };
  var logger = () => {
  };
  function morph(from, toHtml, options) {
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
        return patchElement(from2, to);
      }
      let updateChildrenOnly = false;
      if (shouldSkip(updating, from2, to, () => updateChildrenOnly = true))
        return;
      window.Alpine && initializeAlpineOnTo(from2, to, () => updateChildrenOnly = true);
      if (textOrComment(to)) {
        patchNodeValue(from2, to);
        updated(from2, to);
        return;
      }
      if (!updateChildrenOnly) {
        patchAttributes(from2, to);
      }
      updated(from2, to);
      patchChildren(Array.from(from2.childNodes), Array.from(to.childNodes), (toAppend) => {
        from2.appendChild(toAppend);
      });
    }
    function differentElementNamesTypesOrKeys(from2, to) {
      return from2.nodeType != to.nodeType || from2.nodeName != to.nodeName || getKey(from2) != getKey(to);
    }
    function patchElement(from2, to) {
      if (shouldSkip(removing, from2))
        return;
      let toCloned = to.cloneNode(true);
      if (shouldSkip(adding, toCloned))
        return;
      dom.replace([from2], from2, toCloned);
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
    function patchChildren(fromChildren, toChildren, appendFn) {
      let fromKeyDomNodeMap = {};
      let fromKeyHoldovers = {};
      let currentTo = dom.first(toChildren);
      let currentFrom = dom.first(fromChildren);
      while (currentTo) {
        let toKey = getKey(currentTo);
        let fromKey = getKey(currentFrom);
        if (!currentFrom) {
          if (toKey && fromKeyHoldovers[toKey]) {
            let holdover = fromKeyHoldovers[toKey];
            fromChildren = dom.append(fromChildren, holdover, appendFn);
            currentFrom = holdover;
          } else {
            if (!shouldSkip(adding, currentTo)) {
              let clone = currentTo.cloneNode(true);
              fromChildren = dom.append(fromChildren, clone, appendFn);
              added(clone);
            }
            currentTo = dom.next(toChildren, currentTo);
            continue;
          }
        }
        let isIf = (node) => node.nodeType === 8 && node.textContent === " __BLOCK__ ";
        let isEnd = (node) => node.nodeType === 8 && node.textContent === " __ENDBLOCK__ ";
        if (isIf(currentTo) && isIf(currentFrom)) {
          let newFromChildren = [];
          let appendPoint;
          let nestedIfCount = 0;
          while (currentFrom) {
            let next = dom.next(fromChildren, currentFrom);
            if (isIf(next)) {
              nestedIfCount++;
            } else if (isEnd(next) && nestedIfCount > 0) {
              nestedIfCount--;
            } else if (isEnd(next) && nestedIfCount === 0) {
              currentFrom = dom.next(fromChildren, next);
              appendPoint = next;
              break;
            }
            newFromChildren.push(next);
            currentFrom = next;
          }
          let newToChildren = [];
          nestedIfCount = 0;
          while (currentTo) {
            let next = dom.next(toChildren, currentTo);
            if (isIf(next)) {
              nestedIfCount++;
            } else if (isEnd(next) && nestedIfCount > 0) {
              nestedIfCount--;
            } else if (isEnd(next) && nestedIfCount === 0) {
              currentTo = dom.next(toChildren, next);
              break;
            }
            newToChildren.push(next);
            currentTo = next;
          }
          patchChildren(newFromChildren, newToChildren, (node) => appendPoint.before(node));
          continue;
        }
        if (currentFrom.nodeType === 1 && lookahead) {
          let nextToElementSibling = dom.next(toChildren, currentTo);
          let found = false;
          while (!found && nextToElementSibling) {
            if (currentFrom.isEqualNode(nextToElementSibling)) {
              found = true;
              [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);
              fromKey = getKey(currentFrom);
            }
            nextToElementSibling = dom.next(toChildren, nextToElementSibling);
          }
        }
        if (toKey !== fromKey) {
          if (!toKey && fromKey) {
            fromKeyHoldovers[fromKey] = currentFrom;
            [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);
            fromChildren = dom.remove(fromChildren, fromKeyHoldovers[fromKey]);
            currentFrom = dom.next(fromChildren, currentFrom);
            currentTo = dom.next(toChildren, currentTo);
            continue;
          }
          if (toKey && !fromKey) {
            if (fromKeyDomNodeMap[toKey]) {
              fromChildren = dom.replace(fromChildren, currentFrom, fromKeyDomNodeMap[toKey]);
              currentFrom = fromKeyDomNodeMap[toKey];
            }
          }
          if (toKey && fromKey) {
            let fromKeyNode = fromKeyDomNodeMap[toKey];
            if (fromKeyNode) {
              fromKeyHoldovers[fromKey] = currentFrom;
              fromChildren = dom.replace(fromChildren, currentFrom, fromKeyNode);
              currentFrom = fromKeyNode;
            } else {
              fromKeyHoldovers[fromKey] = currentFrom;
              [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);
              fromChildren = dom.remove(fromChildren, fromKeyHoldovers[fromKey]);
              currentFrom = dom.next(fromChildren, currentFrom);
              currentTo = dom.next(toChildren, currentTo);
              continue;
            }
          }
        }
        let currentFromNext = currentFrom && dom.next(fromChildren, currentFrom);
        patch(currentFrom, currentTo);
        currentTo = currentTo && dom.next(toChildren, currentTo);
        currentFrom = currentFromNext;
      }
      let removals = [];
      while (currentFrom) {
        if (!shouldSkip(removing, currentFrom))
          removals.push(currentFrom);
        currentFrom = dom.next(fromChildren, currentFrom);
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
      els.forEach((el) => {
        let theKey = getKey(el);
        if (theKey) {
          map[theKey] = el;
        }
      });
      return map;
    }
    function addNodeBefore(children, node, beforeMe) {
      if (!shouldSkip(adding, node)) {
        let clone = node.cloneNode(true);
        children = dom.before(children, beforeMe, clone);
        added(clone);
        return [children, clone];
      }
      return [children, node];
    }
    assignOptions(options);
    fromEl = from;
    toEl = typeof toHtml === "string" ? createElement(toHtml) : toHtml;
    if (window.Alpine && window.Alpine.closestDataStack && !from._x_dataStack) {
      toEl._x_dataStack = window.Alpine.closestDataStack(from);
      toEl._x_dataStack && window.Alpine.clone(from, toEl);
    }
    patch(from, toEl);
    fromEl = void 0;
    toEl = void 0;
    return from;
  }
  morph.step = () => resolveStep();
  morph.log = (theLogger) => {
    logger = theLogger;
  };
  function shouldSkip(hook, ...args) {
    let skip = false;
    hook(...args, () => skip = true);
    return skip;
  }
  function initializeAlpineOnTo(from, to, childrenOnly) {
    if (from.nodeType !== 1)
      return;
    if (from._x_dataStack) {
      window.Alpine.clone(from, to);
    }
  }

  // src/render.js
  var queue = {};
  var arrange = {
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
    remove(from) {
      from.remove();
      return null;
    },
    morph(from, to) {
      morph(from, to);
      return document.getElementById(to.id);
    }
  };
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
      let strategy = target.getAttribute("x-arrange") || "replace";
      if (!template) {
        if (!dispatch("ajax:missing", response)) {
          return;
        }
        if (!target.hasAttribute("x-sync")) {
          console.warn(`Target #${id} not found in AJAX response.`);
        }
        if (response.ok) {
          return renderElement(strategy, target, target.cloneNode(false));
        }
        throw new FailedResponseError(el);
      }
      let freshEl = renderElement(strategy, target, template);
      if (freshEl) {
        freshEl.dataset.source = response.url;
      }
      return freshEl;
    });
    let focus = el.getAttribute("x-focus");
    if (focus) {
      focusOn(document.getElementById(focus));
    }
    return targets2;
  }
  function renderElement(strategy, from, to) {
    return arrange[strategy](from, to);
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
        return await render(
          navigateRequest(link),
          targets(targetRoot(link), true),
          link
        );
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
          return render(
            formRequest(form, event.submitter),
            targets(targetRoot(form), true),
            form
          );
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
  function src_default(Alpine) {
    Alpine.addInitSelector(() => `[${Alpine.prefixed("ajax")}]`);
    Alpine.directive("ajax", (el, {}, { cleanup }) => {
      let stopListeningForSubmit = listenForSubmit(el);
      let stopListeningForNavigate = listenForNavigate(el);
      cleanup(() => {
        stopListeningForSubmit();
        stopListeningForNavigate();
      });
    });
    Alpine.magic("ajax", (el) => {
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
        return render(
          request,
          targets(el, options?.sync),
          el,
          Boolean(options?.events)
        );
      };
    });
    Alpine.addInitSelector(() => `[${Alpine.prefixed("load")}]`);
    Alpine.directive("load", (el, { expression }, { evaluate }) => {
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

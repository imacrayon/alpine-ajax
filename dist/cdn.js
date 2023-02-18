(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

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
  (function () {
    if ("submitter" in Event.prototype) return;
    let prototype = window.Event.prototype;
    // Certain versions of Safari 15 have a bug where they won't
    // populate the submitter. This hurts TurboDrive's enable/disable detection.
    // See https://bugs.webkit.org/show_bug.cgi?id=229660
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return; // polyfill not needed
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

  function progressivelyEnhanceLinks(el) {
    if (el.hasAttribute('data-action')) return;
    if (isLocalLink(el)) {
      return convertLinkToButton(el);
    }
    el.querySelectorAll('[href]:not([noajax]):not([data-action])').forEach(link => {
      if (!isLocalLink(link) || isIgnored(link)) return;
      convertLinkToButton(link);
    });
    return el;
  }
  function targets(root, trigger = null, sync = false) {
    let ids = [];
    if (trigger && trigger.hasAttribute('x-target')) {
      ids = trigger.getAttribute('x-target').split(' ');
    } else if (root.hasAttribute('x-target')) {
      ids = root.getAttribute('x-target').split(' ');
    } else {
      ids = [root.id];
    }
    ids = ids.filter(id => id);
    if (ids.length === 0) {
      let description = (root.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[Element]';
      throw Error(`${description} is missing an ID to target.`);
    }
    if (sync) {
      document.querySelectorAll('[x-sync]').forEach(el => {
        if (!el.id) {
          let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? '[x-sync]';
          throw Error(`${description} is missing an ID to target.`);
        }
        if (!ids.includes(el.id)) {
          ids.push(el.id);
        }
      });
    }
    return ids;
  }
  function isIgnored(el) {
    let root = el.closest('[x-ajax],[noajax]');
    return root.hasAttribute('noajax');
  }
  function isLocalLink(el) {
    return el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href').indexOf("#") !== 0 && el.hostname === location.hostname;
  }
  function convertLinkToButton(link) {
    link.setAttribute('role', 'button');
    link.dataset.action = link.getAttribute('href');
    link.tabIndex = 0;
    link.removeAttribute('href');
    link.addEventListener('keydown', event => event.keyCode === 32 && event.target.click());
  }

  function createElement(html) {
      const template = document.createElement('template');
      template.innerHTML = html;
      return template.content.firstElementChild
  }

  function textOrComment(el) {
      return el.nodeType === 3
          || el.nodeType === 8
  }

  let dom = {
      replace(children, old, replacement) {
          let index = children.indexOf(old);

          if (index === -1) throw 'Cant find element in children'

          old.replaceWith(replacement);

          children[index] = replacement;

          return children
      },
      before(children, reference, subject) {
          let index = children.indexOf(reference);

          if (index === -1) throw 'Cant find element in children'

          reference.before(subject);

          children.splice(index, 0, subject);

          return children
      },
      append(children, subject, appendFn) {
          children[children.length - 1];

          appendFn(subject);

          children.push(subject);

          return children
      },
      remove(children, subject) {
          let index = children.indexOf(subject);

          if (index === -1) throw 'Cant find element in children'

          subject.remove();

          return children.filter(i => i !== subject)
      },
      first(children) {
          return this.teleportTo(children[0])
      },
      next(children, reference) {
          let index = children.indexOf(reference);

          if (index === -1) return

          return this.teleportTo(this.teleportBack(children[index + 1]))
      },
      teleportTo(el) {
          if (! el) return el
          if (el._x_teleport) return el._x_teleport
          return el
      },
      teleportBack(el) {
          if (! el) return el
          if (el._x_teleportBack) return el._x_teleportBack
          return el
      }
  };

  let resolveStep = () => {};

  function morph(from, toHtml, options) {
      let toEl;
      let key
          ,lookahead
          ,updating
          ,updated
          ,removing
          ,removed
          ,adding
          ,added;

      function assignOptions(options = {}) {
          let defaultGetKey = el => el.getAttribute('key');
          let noop = () => {};

          updating = options.updating || noop;
          updated = options.updated || noop;
          removing = options.removing || noop;
          removed = options.removed || noop;
          adding = options.adding || noop;
          added = options.added || noop;
          key = options.key || defaultGetKey;
          lookahead = options.lookahead || false;
      }

      function patch(from, to) {
          // This is a time saver, however, it won't catch differences in nested <template> tags.
          // I'm leaving this here as I believe it's an important speed improvement, I just
          // don't see a way to enable it currently:
          //
          // if (from.isEqualNode(to)) return

          if (differentElementNamesTypesOrKeys(from, to)) {
              // Swap elements...
              return patchElement(from, to)
          }

          let updateChildrenOnly = false;

          if (shouldSkip(updating, from, to, () => updateChildrenOnly = true)) return

          window.Alpine && initializeAlpineOnTo(from, to);

          if (textOrComment(to)) {
              patchNodeValue(from, to);
              updated(from, to);

              return
          }

          if (! updateChildrenOnly) {
              patchAttributes(from, to);
          }

          updated(from, to);

          patchChildren(Array.from(from.childNodes), Array.from(to.childNodes), (toAppend) => {
              from.appendChild(toAppend);
          });
      }

      function differentElementNamesTypesOrKeys(from, to) {
          return from.nodeType != to.nodeType
              || from.nodeName != to.nodeName
              || getKey(from) != getKey(to)
      }

      function patchElement(from, to) {
          if (shouldSkip(removing, from)) return

          let toCloned = to.cloneNode(true);

          if (shouldSkip(adding, toCloned)) return

          dom.replace([from], from, toCloned);

          removed(from);
          added(toCloned);
      }

      function patchNodeValue(from, to) {
          let value = to.nodeValue;

          if (from.nodeValue !== value) {
              // Change text node...
              from.nodeValue = value;
          }
      }

      function patchAttributes(from, to) {
          if (from._x_isShown && ! to._x_isShown) {
              return
          }
          if (! from._x_isShown && to._x_isShown) {
              return
          }

          let domAttributes = Array.from(from.attributes);
          let toAttributes = Array.from(to.attributes);

          for (let i = domAttributes.length - 1; i >= 0; i--) {
              let name = domAttributes[i].name;

              if (! to.hasAttribute(name)) {
                  // Remove attribute...
                  from.removeAttribute(name);
              }
          }

          for (let i = toAttributes.length - 1; i >= 0; i--) {
              let name = toAttributes[i].name;
              let value = toAttributes[i].value;

              if (from.getAttribute(name) !== value) {
                  from.setAttribute(name, value);
              }
          }
      }

      function patchChildren(fromChildren, toChildren, appendFn) {
          // I think I can get rid of this for now:
          let fromKeyDomNodeMap = {}; // keyToMap(fromChildren)
          let fromKeyHoldovers = {};

          let currentTo = dom.first(toChildren);
          let currentFrom = dom.first(fromChildren);

          while (currentTo) {
              let toKey = getKey(currentTo);
              let fromKey = getKey(currentFrom);

              // Add new elements
              if (! currentFrom) {
                  if (toKey && fromKeyHoldovers[toKey]) {
                      // Add element (from key)...
                      let holdover = fromKeyHoldovers[toKey];

                      fromChildren = dom.append(fromChildren, holdover, appendFn);
                      currentFrom = holdover;
                  } else {
                      if(! shouldSkip(adding, currentTo)) {
                          // Add element...
                          let clone = currentTo.cloneNode(true);

                          fromChildren = dom.append(fromChildren, clone, appendFn);

                          added(clone);
                      }

                      currentTo = dom.next(toChildren, currentTo);

                      continue
                  }
              }

              // Handle conditional markers (presumably added by backends like Livewire)...
              let isIf = node => node.nodeType === 8 && node.textContent === ' __BLOCK__ ';
              let isEnd = node => node.nodeType === 8 && node.textContent === ' __ENDBLOCK__ ';

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

                  patchChildren(newFromChildren, newToChildren, node => appendPoint.before(node));

                  continue
              }

              // Lookaheads should only apply to non-text-or-comment elements...
              if (currentFrom.nodeType === 1 && lookahead) {
                  let nextToElementSibling = dom.next(toChildren, currentTo);

                  let found = false;

                  while (! found && nextToElementSibling) {
                      if (currentFrom.isEqualNode(nextToElementSibling)) {
                          found = true; // This ";" needs to be here...

                          [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);

                          fromKey = getKey(currentFrom);
                      }

                      nextToElementSibling = dom.next(toChildren, nextToElementSibling);
                  }
              }

              if (toKey !== fromKey) {
                  if (! toKey && fromKey) {
                      // No "to" key...
                      fromKeyHoldovers[fromKey] = currentFrom; // This ";" needs to be here...
                      [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);
                      fromChildren = dom.remove(fromChildren, fromKeyHoldovers[fromKey]);
                      currentFrom = dom.next(fromChildren, currentFrom);
                      currentTo = dom.next(toChildren, currentTo);

                      continue
                  }

                  if (toKey && ! fromKey) {
                      if (fromKeyDomNodeMap[toKey]) {
                          // No "from" key...
                          fromChildren = dom.replace(fromChildren, currentFrom, fromKeyDomNodeMap[toKey]);
                          currentFrom = fromKeyDomNodeMap[toKey];
                      }
                  }

                  if (toKey && fromKey) {
                      let fromKeyNode = fromKeyDomNodeMap[toKey];

                      if (fromKeyNode) {
                          // Move "from" key...
                          fromKeyHoldovers[fromKey] = currentFrom;
                          fromChildren = dom.replace(fromChildren, currentFrom, fromKeyNode);
                          currentFrom = fromKeyNode;
                      } else {
                          // Swap elements with keys...
                          fromKeyHoldovers[fromKey] = currentFrom; // This ";" needs to be here...
                          [fromChildren, currentFrom] = addNodeBefore(fromChildren, currentTo, currentFrom);
                          fromChildren = dom.remove(fromChildren, fromKeyHoldovers[fromKey]);
                          currentFrom = dom.next(fromChildren, currentFrom);
                          currentTo = dom.next(toChildren, currentTo);

                          continue
                      }
                  }
              }

              // Get next from sibling before patching in case the node is replaced
              let currentFromNext = currentFrom && dom.next(fromChildren, currentFrom);

              // Patch elements
              patch(currentFrom, currentTo);

              currentTo = currentTo && dom.next(toChildren, currentTo);
              currentFrom = currentFromNext;
          }

          // Cleanup extra froms.
          let removals = [];

          // We need to collect the "removals" first before actually
          // removing them so we don't mess with the order of things.
          while (currentFrom) {
              if(! shouldSkip(removing, currentFrom)) removals.push(currentFrom);

              currentFrom = dom.next(fromChildren, currentFrom);
          }

          // Now we can do the actual removals.
          while (removals.length) {
              let domForRemoval = removals.shift();

              domForRemoval.remove();

              removed(domForRemoval);
          }
      }

      function getKey(el) {
          return el && el.nodeType === 1 && key(el)
      }

      function addNodeBefore(children, node, beforeMe) {
          if(! shouldSkip(adding, node)) {
              let clone = node.cloneNode(true);

              children = dom.before(children, beforeMe, clone);

              added(clone);

              return [children, clone]
          }

          return [children, node]
      }

      // Finally we morph the element

      assignOptions(options);
      toEl = typeof toHtml === 'string' ? createElement(toHtml) : toHtml;

      // If there is no x-data on the element we're morphing,
      // let's seed it with the outer Alpine scope on the page.
      if (window.Alpine && window.Alpine.closestDataStack && ! from._x_dataStack) {
          toEl._x_dataStack = window.Alpine.closestDataStack(from);

          toEl._x_dataStack && window.Alpine.clone(from, toEl);
      }

      patch(from, toEl);
      toEl = undefined;

      return from
  }

  morph.step = () => resolveStep();
  morph.log = (theLogger) => {
  };

  function shouldSkip(hook, ...args) {
      let skip = false;

      hook(...args, () => skip = true);

      return skip
  }

  function initializeAlpineOnTo(from, to, childrenOnly) {
      if (from.nodeType !== 1) return

      // If the element we are updating is an Alpine component...
      if (from._x_dataStack) {
          // Then temporarily clone it (with it's data) to the "to" element.
          // This should simulate backend Livewire being aware of Alpine changes.
          window.Alpine.clone(from, to);
      }
  }

  let queue = {};
  async function render(request, ids, el) {
    let dispatch = (name, detail = {}) => {
      return el.dispatchEvent(new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true
      }));
    };
    if (!dispatch('ajax:before')) return;
    ids.forEach(id => {
      let busy = document.getElementById(id);
      if (busy) busy.setAttribute('aria-busy', 'true');
    });
    let response = await send(request);
    if (response.ok) {
      dispatch('ajax:success', response);
    } else {
      dispatch('ajax:error', response);
    }
    dispatch('ajax:after', response);
    if (!response.html) return;
    let fragment = document.createRange().createContextualFragment(response.html);
    ids.forEach(id => {
      let template = fragment.getElementById(id);
      let target = document.getElementById(id);
      if (!template) {
        console.warn(`Target #${id} not found in AJAX response.`);
        return morph(target, target.cloneNode(false));
      }
      template.dataset.source = response.url;
      target = morph(target, template);
      return progressivelyEnhanceLinks(target);
    });
  }
  async function send({
    method,
    action,
    body,
    referrer
  }) {
    let onSuccess = response => response;
    let onError = error => error;
    let proxy;
    if (method === 'GET') {
      proxy = enqueue(action);
      if (isLocked(action)) {
        return proxy;
      }
      onSuccess = response => dequeue(action, job => job.resolve(response));
      onError = error => dequeue(action, job => job.reject(error));
    }
    referrer = referrer || window.location.href;
    let response = fetch(action, {
      headers: {
        'X-Alpine-Request': 'true'
      },
      referrer,
      method,
      body
    }).then(readHtml).then(onSuccess).catch(onError);
    return method === 'GET' ? proxy : response;
  }
  function readHtml(response) {
    return response.text().then(html => {
      response.html = html;
      return response;
    });
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
    queue[key] = undefined;
  }

  function listenForSubmit(el) {
    let handler = event => {
      let form = event.target;
      if (isIgnored(form)) return;
      event.preventDefault();
      event.stopPropagation();
      return withSubmitter(event.submitter, () => {
        return render(formRequest(form, event.submitter), targets(el, form, true), form);
      });
    };
    el.addEventListener('submit', handler);
    return () => el.removeEventListener('submit', handler);
  }
  function formRequest(form, submitter = null) {
    let method = (form.getAttribute('method') || 'GET').toUpperCase();
    let action = form.getAttribute('action') || window.location.href;
    let body = new FormData(form);
    if (method === 'GET') {
      action = mergeBodyIntoAction(body, action);
      body = null;
    }
    if (submitter.name) {
      body.append(submitter.name, submitter.value);
    }
    let referrer = form.closest('[data-source]')?.dataset.source;
    return {
      method,
      action,
      body,
      referrer
    };
  }
  async function withSubmitter(submitter, callback) {
    if (!submitter) return await callback();
    let disableEvent = e => e.preventDefault();
    submitter.setAttribute('aria-disabled', 'true');
    submitter.addEventListener('click', disableEvent);
    let focus = submitter === document.activeElement;
    let result = await callback();
    submitter.removeAttribute('aria-disabled');
    submitter.removeEventListener('click', disableEvent);
    if (focus && submitter.isConnected) submitter.focus();
    return result;
  }
  function mergeBodyIntoAction(body, action) {
    let params = Array.from(body.entries()).filter(([key, value]) => value !== '' || value !== null);
    if (params.length) {
      let parts = action.split('#');
      action = parts[0];
      if (!action.includes('?')) {
        action += '?';
      } else {
        action += '&';
      }
      action += new URLSearchParams(params);
      let hash = parts[1];
      if (hash) {
        action += '#' + hash;
      }
    }
    return action;
  }

  function listenForNavigate(el) {
    let handler = event => {
      let link = event.target;
      if (!link.dataset.action) return;
      event.preventDefault();
      event.stopPropagation();
      render(navigateRequest(link), targets(el, link, true), link);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }
  function navigateRequest(link) {
    return {
      method: 'GET',
      action: link.dataset.action,
      referrer: link.closest('[data-source]')?.dataset.source,
      body: null
    };
  }

  function listenForLoad(el, action, event, delay = 0) {
    // Checking for `data-source` prevents an infinite loop.
    if (event) {
      return listenForEvent(event, el, action);
    } else if (delay > 0) {
      setTimeout(() => load(el, action), delay);
      return () => {};
    } else if (!el.dataset.source) {
      load(el, action);
      return () => {};
    }
  }
  function listenForEvent(event, el, action) {
    let handler = () => {
      load(el, action);
      window.removeEventListener(event, handler);
    };
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }
  function load(el, action) {
    render({
      method: 'GET',
      action
    }, [el.id], el);
  }

  function ajax (Alpine) {
    Alpine.directive('ajax', (el, {}, {
      cleanup
    }) => {
      progressivelyEnhanceLinks(el);
      let stopListeningForSubmit = listenForSubmit(el);
      let stopListeningForNavigate = listenForNavigate(el);
      cleanup(() => {
        stopListeningForSubmit();
        stopListeningForNavigate();
      });
    });
    Alpine.directive('load', (el, {
      value,
      modifiers,
      expression
    }, {
      cleanup
    }) => {
      let delay = modifiers.length ? modifiers[0].split('ms')[0] : 0;
      let stopListeningForLoad = listenForLoad(el, expression, value, delay);
      cleanup(() => {
        stopListeningForLoad();
      });
    });
  }

  document.addEventListener('alpine:initializing', () => {
    ajax(window.Alpine);
  });

}));

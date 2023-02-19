(() => {
  // src/submitter-polyfill.js
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

  // src/helpers.js
  function targets(root, trigger = null, sync = false) {
    let ids = [];
    if (trigger && trigger.hasAttribute("x-target")) {
      ids = trigger.getAttribute("x-target").split(" ");
    } else if (root.hasAttribute("x-target")) {
      ids = root.getAttribute("x-target").split(" ");
    } else {
      ids = [root.id];
    }
    ids = ids.filter((id) => id);
    if (ids.length === 0) {
      let description = (root.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "[Element]";
      throw Error(`${description} is missing an ID to target.`);
    }
    if (sync) {
      document.querySelectorAll("[x-sync]").forEach((el) => {
        if (!el.id) {
          let description = (el.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "[x-sync]";
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
    let root = el.closest("[x-ajax],[noajax]");
    return root.hasAttribute("noajax");
  }

  // src/prefetch.js
  var lastTouchedAt;
  var mouseoverTimer;
  var TOUCH_THRESHOLD = 1111;
  var prefetched = /* @__PURE__ */ new Set();
  function isPrefetchable(el) {
    if (!el || el.hasAttribute("noprefetch")) {
      return false;
    }
    if (el.dataset.prefetch) {
      return true;
    }
    return el.href && !el.hash && el.origin == location.origin && ["http:", "https:"].includes(el.protocol) && (location.protocol == "http:" ? el.protocol == "http:" : true);
  }
  function listenForPrefetch(el) {
    el.addEventListener("touchstart", touchstartListener, { capture: true, passive: true });
    el.addEventListener("mouseover", mouseoverListener, { capture: true, passive: true });
  }
  function touchstartListener(event) {
    lastTouchedAt = performance.now();
    let link = event.target.closest("a");
    if (!isPrefetchable(link)) {
      return;
    }
    prefetch(link.href || link.dataset.href, "high");
  }
  function mouseoverListener(event) {
    if (performance.now() - lastTouchedAt < TOUCH_THRESHOLD) {
      return;
    }
    if (!("closest" in event.target)) {
      return;
    }
    let link = event.target.closest("a");
    if (!isPrefetchable(link)) {
      return;
    }
    link.addEventListener("mouseout", mouseoutListener, { passive: true });
    mouseoverTimer = setTimeout(() => {
      prefetch(link.href || link.dataset.href, "high");
      mouseoverTimer = void 0;
    }, 65);
  }
  function mouseoutListener(event) {
    if (event.relatedTarget && event.target.closest("a") == event.relatedTarget.closest("a")) {
      return;
    }
    if (mouseoverTimer) {
      clearTimeout(mouseoverTimer);
      mouseoverTimer = void 0;
    }
  }
  function prefetch(url, fetchPriority = "auto") {
    if (prefetched.has(url)) {
      return;
    }
    let linkElement = document.createElement("link");
    linkElement.rel = "prefetch";
    linkElement.href = url;
    linkElement.fetchPriority = fetchPriority;
    document.head.appendChild(linkElement);
    prefetched.add(url);
  }

  // src/link.js
  function listenForNavigate(el) {
    let handler = (event) => {
      let link = event.target;
      if (!link.dataset.href)
        return;
      event.preventDefault();
      event.stopPropagation();
      render(navigateRequest(link), targets(el, link, true), link);
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }
  function navigateRequest(link) {
    return {
      method: "GET",
      action: link.dataset.href,
      referrer: link.closest("[data-source]")?.dataset.source,
      body: null
    };
  }
  function progressivelyEnhanceLinks(el) {
    if (el.hasAttribute("data-href"))
      return;
    if (isLocalLink(el)) {
      return convertLinkToButton(el);
    }
    el.querySelectorAll("[href]:not([noajax]):not([data-href])").forEach((link) => {
      if (!isLocalLink(link) || isIgnored(link))
        return;
      convertLinkToButton(link);
    });
    return el;
  }
  function isLocalLink(el) {
    return el.href && !el.hash && el.origin == location.origin;
  }
  function convertLinkToButton(link) {
    link.setAttribute("role", "button");
    link.dataset.href = link.getAttribute("href");
    link.tabIndex = 0;
    if (isPrefetchable(link)) {
      link.dataset.prefetch = "true";
    }
    link.removeAttribute("href");
    link.addEventListener("keydown", (event) => (event.keyCode === 32 || event.keyCode === 13) && event.target.click());
  }

  // src/render.js
  var queue = {};
  var renderElement;
  function setRenderer(renderer) {
    renderElement = renderer;
  }
  async function render(request, ids, el) {
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
    ids.forEach((id) => {
      let template = fragment.getElementById(id);
      let target = document.getElementById(id);
      if (!template) {
        console.warn(`Target #${id} not found in AJAX response.`);
        return renderElement(target, target.cloneNode(false));
      }
      template.dataset.source = response.url;
      renderElement(target, template);
      return progressivelyEnhanceLinks(document.getElementById(id));
    });
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

  // src/load.js
  function listenForLoad(el, action, event, delay = 0) {
    if (event) {
      return listenForEvent(event, el, action);
    } else if (delay > 0) {
      setTimeout(() => load(el, action), delay);
      return () => {
      };
    } else if (!el.dataset.source) {
      load(el, action);
      return () => {
      };
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
    render({ method: "GET", action }, [el.id], el);
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
        return render(formRequest(form, event.submitter), targets(el, form, true), form);
      });
    };
    el.addEventListener("submit", handler);
    return () => el.removeEventListener("submit", handler);
  }
  function formRequest(form, submitter = null) {
    let method = (form.getAttribute("method") || "GET").toUpperCase();
    let action = form.getAttribute("action") || window.location.href;
    let body = new FormData(form);
    if (method === "GET") {
      action = mergeBodyIntoAction(body, action);
      body = null;
    }
    if (submitter.name) {
      body.append(submitter.name, submitter.value);
    }
    let referrer = form.closest("[data-source]")?.dataset.source;
    return { method, action, body, referrer };
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
    if (focus && submitter.isConnected)
      submitter.focus();
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

  // src/index.js
  function src_default(Alpine) {
    setRenderer(Alpine.morph ?? ((from) => {
      console.warn(`You can't use Alpine AJAX without first installing the "morph" plugin here: https://alpinejs.dev/plugins/morph`);
      return from;
    }));
    listenForPrefetch(document);
    Alpine.directive("ajax", (el, {}, { cleanup }) => {
      progressivelyEnhanceLinks(el);
      let stopListeningForSubmit = listenForSubmit(el);
      let stopListeningForNavigate = listenForNavigate(el);
      cleanup(() => {
        stopListeningForSubmit();
        stopListeningForNavigate();
      });
    });
    Alpine.directive("load", (el, { value, modifiers, expression }, { cleanup }) => {
      let delay = modifiers.length ? modifiers[0].split("ms")[0] : 0;
      let stopListeningForLoad = listenForLoad(el, expression, value, delay);
      cleanup(() => {
        stopListeningForLoad();
      });
    });
  }

  // builds/cdn.js
  document.addEventListener("alpine:initializing", () => {
    src_default(window.Alpine);
  });
})();

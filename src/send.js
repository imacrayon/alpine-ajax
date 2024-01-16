let jobs = {}

export async function send({ method, action, body, referrer, headers }, followRedirects) {
  // When duplicate `GET` requests are issued we'll proxy
  // the initial request to save network roundtrips.
  let proxy
  let handleRedirects = redirectHandler(followRedirects)
  let onSuccess = response => response
  let onError = error => error
  if (method === 'GET') {
    proxy = enqueue(action)
    if (isLocked(action)) {
      return proxy
    }
    onSuccess = response => dequeue(action, job => job.resolve(response))
    onError = error => dequeue(action, job => job.reject(error))
  }

  referrer = referrer || window.location.href

  let response = fetch(action, {
    headers,
    referrer,
    method,
    body,
  }).then(handleRedirects)
    .then(readHtml)
    .then(onSuccess)
    .catch(onError)

  return method === 'GET' ? proxy : response
}

function readHtml(response) {
  return response.text().then(html => {
    response.html = html
    return response
  })
}

function enqueue(key) {
  if (!jobs[key]) {
    jobs[key] = []
  }
  let job = {}
  let proxy = new Promise((resolve, reject) => {
    job.resolve = resolve
    job.reject = reject
  })
  jobs[key].push(job)

  return proxy
}

function isLocked(key) {
  return jobs[key].length > 1
}

function dequeue(key, resolver) {
  (jobs[key] || []).forEach(resolver)
  jobs[key] = undefined
}

function redirectHandler(follow) {
  return follow
    ? (response) => response
    : (response) => {
      if (response.redirected) {
        window.location.href = response.url
        return
      }

      return response
    }
}

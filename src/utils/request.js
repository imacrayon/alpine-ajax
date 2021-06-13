export function request(method, url, data, options) {

  if (method === 'GET') {
    let params = Array.from(data.entries())
      .filter(([key, value]) => value !== '' || value !== null)
    if (params.length) {
      let splitUrl = url.split('#')
      let anchor = splitUrl[1]
      url = splitUrl[0]
      if (url.includes('?')) {
          url += '?'
      } else {
          url += '&'
      }
      url += new URLSearchParams(params)
      if (anchor) {
          url += '#' + anchor
      }
    }
    data = null
  }

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.overrideMimeType('text/html')

    let headers = Object.assign({
      'X-Requested-With': 'XMLHttpRequest',
      'X-Alpine-Request': 'true',
    }, options.headers)

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    if (options.progress && xhr.upload) {
      xhr.upload.addEventListener('progress', options.progress)
    }

    let info = { xhr, url, data, options }

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 400) return resolve(xhr.response)

      reject(info)
    }

    xhr.onerror = function () {
      reject(info)
    }

    xhr.send(data)
  })
}

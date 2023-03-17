---
layout: example.webc
title: Progress Bar
---

This example shows how to implement a smoothly scrolling progress bar.

We start with an AJAX form that issues a `POST` request to `/jobs` to begin a job process:

```html
<form x-ajax id="jobs" method="post" action="/jobs">
  <h3>New Job</h3>
  <button>Start New Job</button>
</form>
```

Note that the form is assigned `id="jobs"`. When the form is submitted, it is then replaced with a new `<div>` that reloads itself every 600ms:

```html
<div id="jobs" x-load="setTimeout(() => $ajax('/jobs/1'), 600)">
  <h3 id="progress_label">Job Progress</h3>
  <div role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" aria-labelledby="progress_label">
    <svg style="width:25%; transition: width .3s " width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="blue"></rect>
    </svg>
  </div>
</div>
```

This HTML is rerendered every 600 milliseconds, with the `width` style attribute on the progress bar being updated.
Here we've also added a `transition` rule, to make the visual transition continuous rather than jumpy.

Finally, when the job is complete, the `x-load` directive is removed and a restart `<form>` is added to the UI:

```html
<div id="jobs" x-data>
  <h3 id="progress_label">Job Progress</h3>
  <div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-labelledby="progress_label">
    <svg style="width:100%; transition: width .3s " width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="blue"></rect>
    </svg>
  </div>
  <form x-ajax x-target="jobs" method="post" action="/jobs">
    <button>Restart Job</button>
  </form>
</div>
```

<script>
  document.addEventListener('DOMContentLoaded', () => {
    window.server({
      'GET /jobs/create': () => create(),
      'POST /jobs': () => {
        let job = jobManager.start()
        return show(job)
      },
      'GET /jobs/1': () => {
        let job = jobManager.currentProcess()
        return show(job)
      },
    }).get('/jobs/create')
  })

  function create() {
    return `<form x-ajax id="jobs" method="post" action="/jobs">
    <h3>New Job</h3>
  <button>Start New Job</button>
</form>`;
  }

  function show(job) {
    let directive = ''
    if (!job.complete) {
      directive = `x-load="setTimeout(() => $ajax('/jobs/1'), 600)" `
    }

    return `<div ${directive}id="jobs">
  <h3 id="progress_label">Job Progress</label>
  <div role="progressbar" aria-valuenow="${job.progress}" aria-valuemin="0" aria-valuemax="100" aria-labelledby="progress_label" style="overflow:hidden;">
    <svg style="width:${job.progress}%;transition: width .3s " width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="var(--nc-lk-2)"></rect>
    </svg>
  <div>
  ${restart(job)}
</div>`
  }

  function restart(job) {
    if (!job.complete) return '';
    return `<form x-ajax x-target="jobs" method="post" action="/jobs">
  <button>Restart Job</button>
</form>`
  }

  var jobManager = (function () {
    let job = null;
    return {
      start: function () {
        job = {
          complete: false,
          progress: 0
        }
        return job;
      },
      currentProcess: () => {
        job.progress += Math.min(100, Math.floor(33 * Math.random()));  // simulate progress
        job.complete = job.progress >= 100;
        return job;
      }
    }
  })()
</script>

---
eleventyNavigation:
  key: Navigation
  url: /reference/#navigation
  order: 12
---

## Navigation

Let's talk about the "Single Page Application" for a moment: This is a common pattern where every link on a webpage is made to issue an AJAX request instead of the standard full page refresh. The motivation behind SPA navigation is to reduce the page load and create a responsive experience that feels fast to the end user. However, SPA navigation also introduces a host of state management and accessibility concerns:
  * Page history must be cached and handled in client-side code rather than natively in the Browser
  * SPA navigation [introduces accessibility issues](https://github.com/hotwired/turbo/issues/774) that [require special consideration](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/)
  * Long-running JavaScript code can introduce runaway memory leaks and state synchronization issues

In the time since the "Single Page Application" was introduced browsers have eliminated many of the problems SPA navigation was designed to work around:

  * Browsers now implement [Paint Holding](https://developer.chrome.com/blog/paint-holding/) so users don't see a blank white page before a new page is loaded
  * Browsers [cache compiled JavaScript](https://v8.dev/blog/code-caching) across page loads, so that it can be [efficiently run on the next page load](https://dev.to/v8blink/lets-understand-chrome-v8-chapter-19-compilation-cache-make-the-compiler-faster-22ml)
  * The [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) dramatically simplifies preloading assets before a link is clicked so that the next page can load instantly. Libraries like [instant.page](https://instant.page/) and [quicklink](https://github.com/GoogleChromeLabs/quicklink) provide cross-browser support for preloading.
  * Chromium browsers support [Multi-Page Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) with support in more browsers [coming soon](https://bugzilla.mozilla.org/show_bug.cgi?id=1909173).
  * [Service Workers](https://github.com/DannyMoerkerke/basic-service-worker) provide advanced asset caching and offline support

All of these platform-native technologies can be combine to create very modern user experiences without the big drawbacks and extra work that come with SPA navigation, so before you start slapping `x-target` on every link in your project, consider that [one change to your `<head>`](https://github.com/csswizardry/csswizardry.github.com/commit/77285ba766bf94aed2a9fc66e10c91cef57d9f0a) may be all you need to achieve peak performance™.

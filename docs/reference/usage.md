---
eleventyNavigation:
  key: Usage
  url: /reference/#usage
  order: 2
---

## Usage

It’s good practice to start building your UI **without** Alpine AJAX. Make your entire website work as it would if Alpine AJAX were not available, then sprinkle in AJAX functionality at the end. Working in this way will ensure that your AJAX interactions degrade gracefully [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html): Links and forms will continue to work as normal, they simply won't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your website.

### See it in in action

<lite-youtube videoid="vNiZyFVmoOI" class="border-4 border-blue-800" style="background-image: url('https://i.ytimg.com/vi/vNiZyFVmoOI/hqdefault.jpg');">
  <a href="https://youtube.com/watch?v=vNiZyFVmoOI" class="lty-playbtn" title="Play Video">
    <span class="lyt-visually-hidden">Play Video: Alpine AJAX</span>
  </a>
</lite-youtube>

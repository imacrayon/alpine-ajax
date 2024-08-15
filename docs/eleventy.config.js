const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const { EleventyHtmlBasePlugin, EleventyRenderPlugin } = require('@11ty/eleventy')
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const pluginBundle = require("@11ty/eleventy-plugin-bundle")
const pluginNavigation = require("@11ty/eleventy-navigation")
const esbuild = require('esbuild')
const postcss = require('postcss')
const lockFile = require('../package-lock.json')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('css')
  eleventyConfig.addPassthroughCopy('fonts')
  eleventyConfig.addPassthroughCopy('img')
  eleventyConfig.addPassthroughCopy({
    '_includes/googlec8986a0731969a6e.html': 'googlec8986a0731969a6e.html'
  })

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)
  eleventyConfig.addPlugin(pluginNavigation)
  eleventyConfig.addPlugin(EleventyRenderPlugin)
  eleventyConfig.addPlugin(pluginSyntaxHighlight)
  eleventyConfig.addPlugin(pluginBundle, {
    transforms: [
      async function (content) {
        // this.type returns the bundle name.
        if (this.type === 'css') {
          // Same as Eleventy transforms, this.page is available here.
          let result = await postcss([
            require('autoprefixer'),
            require('tailwindcss')
          ]).process(content, { from: this.page.inputPath, to: null })

          return result.css
        }

        return content
      }
    ]
  })

  eleventyConfig.addGlobalData('APLINE_VERSION', () => lockFile.packages['node_modules/alpinejs'].version)
  eleventyConfig.addGlobalData('APLINE_AJAX_VERSION', () => lockFile.version)

  eleventyConfig.addFilter('sort', (collection, path = '') => {
    let keys = path.split('.')
    let value = (entry) => keys.reduce((v, k) => v?.[k], entry)

    return collection.slice().sort((a, b) => value(a) - value(b))
  })

  eleventyConfig.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['js/main.js'],
      bundle: true,
      outfile: '_site/js/main.js',
      sourcemap: true,
      minify: true,
    })
  })

  let markdownLibrary = markdownIt({
    html: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'direct-link',
      symbol: '#'
    }),
    level: [1, 2, 3, 4],
    slugify: eleventyConfig.getFilter('slugify')
  })
  eleventyConfig.setLibrary('md', markdownLibrary)

  eleventyConfig.setServerOptions({
    watch: ['_sites/**/*.js'],
  })

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: "njk",
  }
}

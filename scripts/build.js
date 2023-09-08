let fs = require('fs')
let zlib = require('zlib')
let esbuild = require('esbuild')

let builds = [
  {
    entryPoints: ['builds/cdn.js'],
    outfile: 'dist/cdn.js',
    bundle: true,
    platform: 'browser',
  },
  {
    entryPoints: [`builds/cdn.js`],
    outfile: 'dist/cdn.min.js',
    bundle: true,
    minify: true,
    platform: 'browser',
    plugins: [size('dist/cdn.min.js')]
  },
  {
    entryPoints: [`builds/module.js`],
    outfile: 'dist/module.esm.js',
    bundle: true,
    platform: 'neutral',
    mainFields: ['module', 'main'],
  },
  {
    entryPoints: [`builds/module.js`],
    outfile: 'dist/module.cjs.js',
    bundle: true,
    target: ['node10.4'],
    platform: 'node',
  },
  {
    entryPoints: [`builds/server.js`],
    outfile: 'dist/server.js',
    bundle: true,
    platform: 'neutral',
  },
]

builds.forEach(async config => {
  if (process.argv.includes('--watch')) {
    esbuild.context(config).watch().catch(() => process.exit(1))
  } else {
    esbuild.build(config).catch(() => process.exit(1))
  }
})

function size(file) {
  return {
    name: 'size',
    setup(build) {
      build.onEnd(() => {
        let size = bytesToSize(zlib.brotliCompressSync(fs.readFileSync(file)).length)

        console.log("\x1b[32m", `${file}: ${size}`)
      })
    }
  }
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

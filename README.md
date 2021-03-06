Makes ASCII-art from any renderable input

- `CPURenderer` demos: [static][demo-static]
- `GPURenderer` demos: [dynamic][demo-dynamic], [knot][demo-knot]

## Installation

> **Tip:** see [Git URLs as Dependencies][git-urls]

```sh
npm install reinventing-wheels/ascii
```

## Importing

In NodeJS:

> **Note:** assumes using something like webpack/rollup

```js
import * as ASCII from 'ascii/dist/esm'
```

In a browser:

> **Tip:** check out [jsDelivr][jsdelivr] if you're looking for CDN links

```js
import * as ASCII from 'path/to/bundle.esm.js'
```

```html
<script src='path/to/bundle.umd.js'></script>
```

## Usage

> **Tip:** use [VSCode][vsc] or any other editor with [TypeScript][ts] declarations support

```js
// fast, uses webgl2
const renderer = new ASCII.GPURenderer({
  // `ascii`, `extended` and `extra` are available
  // you can also provide your own, of course
  charSet: ASCII.charSets.ascii,

  // should match the font you're going to use
  // to display the result
  fontFamily: 'monospace',

  // rendering settings
  gamma:  1.0,
  signal: 1.0,
  noise:  0.0
})

// slow, uses canvas 2d api
const renderer = new ASCII.CPURenderer({
  // ...
})

const source = // image, video, canvas or bitmap
const result = renderer.render(source, width, height)
// `result` is `height` lines of text
// each is `width` symbols wide
```

[ts]: //www.typescriptlang.org
[vsc]: //code.visualstudio.com
[git-urls]: //docs.npmjs.com/files/package.json#git-urls-as-dependencies
[jsdelivr]: //www.jsdelivr.com/github

[demo-static]: //reinventing-wheels.github.io/ascii/demo/static.html
[demo-dynamic]: //reinventing-wheels.github.io/ascii/demo/dynamic.html
[demo-knot]: //reinventing-wheels.github.io/ascii/demo/knot.html

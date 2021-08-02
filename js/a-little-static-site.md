# A small static page generator for Node

With HTML/JS as your output, it can be very tempting to write a single web page in just a single `.html` file. HTML definitely feels like an _output_ format, you get OK tooling support in VS Code but there's very little abstractions in the language to do anything re-usable. So, nearly all of the time it pays off to add build tooling.

The last single-page mini-site I built, [shiki-twoslash's homepage](https://shikijs.github.io/twoslash/), using Next.js and while that is a slick setup. It's overkill for a single page. For example, I had to post-process their output to remove a bunch of JavaScript. I wasn't using the tool for what it was made for. I've built sites big and small with Gatsby, Next.js, Jekyll, 11ty etc and they all have their place in generating static sites, and a single page with no JS ain't it. [Astro][https://astro.build] is probably the best fit.

For a project I was looking at, I needed to keep everything as vanilla as possible. So, Node, not Deno, npm not pnpm etc. Every extra dependency is a weight, and I asked myself what is an the absolute minimal approach to building a static HTML page with useful tooling?

## Requirements

Things I'd need:

 - IDE-level assistance
 - A good templating system to allow code re-use
 - Saving and seeing the changes

For "IDE-level assistance", I can use `// @ts-check` to get good enough tooling support in a JS file. There's not enough value for TypeScript in basically a single file project. 

A good templating system turned out to be JSX, no-one else gets as high quality tooling because no-one else has the TypeScript team supporting their templating system as a first class citizen. This introduces a problem though, your JS files need a compile step.

Finally, I need a way to save a file in my editor and see the changes. It doesn't need to be hot module reloading (there's no JS in the output anyway) but it should be fast enough.

## Result

We're going to build a dev server in node, which triggers rendering some JSX files to a static HTML file on saves. To do that, we'll need some dependencies:

 - [`esbuild`](https://www.npmjs.com/package/esbuild) for JSX -> JS
 - [`react`](https://www.npmjs.com/package/react) for a JSX runtime
 - [`react-dom`](https://www.npmjs.com/package/react-dom) for JSX -> HTML
 - [`ws`](https://www.npmjs.com/package/ws) for a server-side websocket

The folder structure will look like:

```
❯ tree .
.
├── index.html
├── node_modules
├── package.json
└── src
    ├── build.jsx
    ├── components.jsx
    └── server.js
```

With a root `index.html` being the output page, and all the JS living inside the `src` dir. We'll be focusing on `src/server.js`.

## Building the HTML

```twoslash include main
import { execSync } from "child_process";
import { watch, readFileSync } from "fs"
import { createServer } from "http"
import { tmpdir } from "os";
import { join } from "path";
import { stdout } from "process";
import { Server } from 'ws';
```

I'm writing ESM, so I can't rely on clearing the [`require.cache`](https://bambielli.com/til/2017-04-30-node-require-cache/) to force the current process to re-evaluate changed JS inside Node. So, the hacky, but a wee bit slower method is to shell out each time:

```ts twoslash title="src/server.js"
/// <reference types="node" />
// ---cut---
import { execSync } from "child_process";
import { watch, readFileSync } from "fs"
import { tmpdir } from "os";
import { join } from "path";

// Convert and run the 'app' code
const build = () => {
  const tmpFile = join(tmpdir(), "tc39-template.js")

  // JSX -> JS, then evaluate that output in node
  try {
    execSync(`npm run esbuild --log-level=warning --platform=node --bundle src/build.jsx --outfile=${tmpFile}`)
    execSync(`node ${tmpFile}`)
  } catch (error) {
    console.log(error)
  }
}
```

Next we need to keep track of when a file changes, and trigger that function:

```ts twoslash title="src/server.js"
/// <reference types="node" />
declare function build(): void
// ---cut---
import { watch } from "fs"
import { stdout } from "process";

// FS watcher on the src dir which triggers a re-build, and then tells
// any connected webpages to reload.
watch("./src", () => {
  stdout.write(".");
  build()
});
```

Yeah, good fs watching primitives ship with node. The `watch` function in `fs` is good enough for the TypeScript compiler, so it's good enough for me. If you want a better one, [look at watchman](https://github.com/microsoft/TypeScript-Website/issues/130#issuecomment-664673740) which I use in the TS website.



## Build Script

This will convert a JSX tree to HTML, it doesn't build it in a way which allows for using the React component APIs, but I don't want to be building JS powered experiences when HTML will do:

```jsx twoslash title="src/build.jsx"
/// <reference types="node" />
// ---cut---
// @ts-check
import ReactDOMServer from 'react-dom/server';
import {writeFileSync} from "fs"

const Page = () => <html>
    <head>
        <title>My web page</title>
      </head>
    <body>
        <p>Hello, world</p>
    </body>
</html>

const html = ReactDOMServer.renderToStaticMarkup(<Page />)
writeFileSync("./index.html", html)
```

This is enough to get started. You can start the server by running `node src/server.js` and pressing save in the `src` dir will re-build the `index.html`.

## Build and Refresh

This is good enough, but I want comfortable. So, I'd like the browsers to refresh when I press save. This means there needs to be a websocket connecting the browser to the dev server, and we need to send a message from the server to clients to update.

To start off, we'll switch to making a http server, while you might think to reach for express/koa/fastify - the one in Node is good enough for TypeScript, and so it's good enough for me. Let's make a server which responds with the HTML for your file:

```js twoslash title="src/server.js"
/// <reference types="node" />
// ---cut---
import { watch, readFileSync } from "fs"
import { createServer } from "http"

// Starts up a HTTP server which passes along the html
const server = createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(readFileSync("./index.html", "utf8"));
  res.end();
}).listen(8080);
```

I looked into what the websocket support looks like in Node, and it's something I'd have had to build myself and I'm certainly not doing that. So, we can use [`ws`](https://github.com/websockets/ws) as a dependency here, I used it in Peril and it has no dependencies.

```js twoslash title="src/server.js"
/// <reference types="node" />
// ---cut---
import { createServer } from "http"
import { stdout } from "process";
import { Server } from 'ws';

// ...

// Create a websocket, and file watcher so that pressing save in the index
// triggers a browser reload, letting you edit without jumping over and
// refreshing.
const wss = new Server({ server });
console.log("Started up dev server: http://localhost:8080")

// FS watcher on the src dir which triggers a re-build, and then tells
// any connected webpages to reload.
watch("./src", () => {
  stdout.write(".");
  build()

  wss.clients.forEach(client => client.send("reload"))
});
```

That's the server set up, it can now load up a dev server and file watcher. Changes to the `./src/*` files trigger any connected clients to refresh.


Here's `./src/server.js` in full:

```js twoslash
import { execSync } from "child_process";
import { watch, readFileSync } from "fs"
import { createServer } from "http"
import { tmpdir } from "os";
import { join } from "path";
import { stdout } from "process";
import { Server } from 'ws';

// Convert and run the 'app' code
const build = () => {
  // We can't edit the require cache in ESM, so this needs to run through
  // a new process each time.
  const tmpFile = join(tmpdir(), "tc39-template.js")

  // JSX -> JS, then evaluate that in node
  try {
    execSync(`yarn esbuild --log-level=warning --platform=node --bundle src/build.jsx --outfile=${tmpFile}`)
    execSync(`node ${tmpFile}`)
  } catch (error) {
    console.log(error)
  }
}

// Starts up a HTTP server which builds the site each time it is requested 
const server = createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(readFileSync("./index.html", "utf8"));
  res.end();
}).listen(8080);

// Create a websocket, and file watcher so that pressing save in the index
// triggers a browser reload, letting you edit without jumping over and
// refreshing.
const wss = new Server({ server });
console.log("Started up dev server: http://localhost:8080")

// FS watcher on the src dir which triggers a re-build, and then tells
// any connected webpages to reload.
watch("./src", () => {
  stdout.write(".");
  build()

  wss.clients.forEach(client => client.send("reload"))
});

// Trigger a build anyway
build()
```

## Client Side

We need the `index.html` to be able to connect back to the websocket dev server, to do that we can use a React component. So, make your first component in `./src/components.jsx`.

```jsx twoslash
// @ts-check
/** A websocket connection to the dev server which triggers a reload */
export const DevWebSocket = () => {
    if (!process.env.SITE_DEV) {
        return null
    }

    const js = `
// Listen for messages telling us to reload
const socket = new WebSocket('ws://localhost:8080');
socket.addEventListener('message', function (event) {
    document.location.reload()
});`

    return <script dangerouslySetInnerHTML={{ __html: js}} />
}
```

This component NOOPs unless the env var `SITE_DEV` is set up, and it simply jams some JavaScript into the page which connects to the dev server, and on receiving any message it will trigger a reload. This needs importing in `./src/build.jsx`.

```jsx twoslash title="src/build.jsx"
/// <reference types="node" />
// @filename: components.jsx
export const DevWebSocket = () => <div />
// @filename: build.jsx
/// <reference types="node" />
import React from 'react';
// ---cut---
// @ts-check
import ReactDOMServer from 'react-dom/server';
import {writeFileSync} from "fs"
import {DevWebSocket} from "./components.jsx"

const Page = () => <html>
    <head>
        <title>My web page</title>
        <DevWebSocket />
      </head>
    <body>
        <p>Hello, world</p>
    </body>
</html>

const html = ReactDOMServer.renderToStaticMarkup(<Page />)
writeFileSync("./index.html", html)
```

This means running `SITE_ENV="true" node src/server.js` will start up a dev server, where pressing save will render the JSX tree to HTML and reload all open web-pages. We did it with very few tools, and ideally understood how all of the pieces came together.

## Moving Inline

With the system working, we can look at making the iterations a bit faster. The slowest parts by far are the two `execSync`s. Let's replace these with in-process work to avoid the loading of a new process, and the node/npm boot times. The easy step is to convert the `esbuild` call to the esbuild JavaScript API:

```diff
+ import { buildSync } from "esbuild";

- execSync(`npm run esbuild --log-level=warning --platform=node --bundle src/build.jsx --outfile=${tmpFile}`)
+ const result = buildSync({ logLevel: "warning", platform: "node", bundle: true, outfile: tmpFile, entryPoints: ['src/build.jsx'] })
```

That should shave a bit of time off the build process, you're mostly looking at dropping the nodejs bootup for npm and then any `npm run` overhead. Next we need to try run this code inline. Now, I mentioned earlier that we can't use a require cache to import the code, so that's not really doable - but a simpler answer does exist: `eval`.

To safely eval the code we don't need much. esbuild, bundles and converts our JS to commonjs, which means we need a `require` in scope. In ESM Node, we can create our own `require` function via `createRequire(import.meta.url)` which means we can convert our entire build function to:

```ts twoslash
// @include: main
// ---cut---
import { buildSync } from "esbuild"
import { createRequire } from 'module';

// Convert and run the 'app' code
const build = () => {
  const tmpFile = join(tmpdir(), "tc39-template.js")

  // JSX -> JS, then evaluate that in node
  const result = buildSync({ logLevel: "warning", platform: "node", bundle: true, outfile: tmpFile, entryPoints: ['src/build.jsx'] })
  if (!result.errors.length) {
    try {
      const require = createRequire(import.meta.url);
      eval(readFileSync(tmpFile, "utf8"))
    } catch (error) {
      console.log(error) 
    }
  }
}
```
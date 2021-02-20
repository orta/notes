# Commit Messages With Monorepo Scopes

I'm [lazy](https://artsy.github.io/blog/2016/03/02/Lazily-Automation/) - when I see my friends doing things I want to do but I know I can't be bothered to put the work in, I just automate a rough approximation. 

[@alloy](https://github.com/alloy/flow2dts/commits?author=alloy) nearly always marks his commits with a context, e.g.

- `[overrides] Add Dimensions typings`
- `[package] Actually use our own generated files`
- `[polyfill] Make $TypeOf also return the class`

This is cool, yeah, but I'm not going to remember to do this. Instead what I've been doing is automating that via git hooks.

As I'm mostly in JS projects, I use [husky v4](https://www.npmjs.com/package/husky/v/4.3.8) to set up my hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "yarn test && yarn danger local --dangerfile dangerfile.local.ts --staging",
      "pre-push": "yarn build && yarn test",
      "prepare-commit-msg": "node scripts/prefixCommitMsg.mjs"
    }
  },
}
```

The key one being `prepare-commit-msg` which runs a JS script:

```js twoslash
// @strict: false
/// <reference types="node" /> 
// @ts-check
import fs from "fs"
import { execSync } from "child_process"

const fileToEdit = process.env.HUSKY_GIT_PARAMS.split(" ")[0]
const files = execSync("git status --porcelain", { encoding: "utf8" })

const maps = {
  "spelltower/": "SPTWR",
  "typeshift/": "TPSFT",
}

const prefixes = new Set()
files.split("\n").forEach(f => {
  const found = Object.keys(maps).find(prefix => f.includes(prefix))
  if (found) prefixes.add(maps[found])
})

if (prefixes.size) {
  const prefix = [...prefixes.values()].sort().join(", ")
  const msg = fs.readFileSync(fileToEdit, "utf8")
  if (!msg.includes(prefix)) {
    fs.writeFileSync(fileToEdit, `[${prefix}] ${msg}`)
  }
}
```

This JS script looks up what files were changed in the commit (via `git status`), and then adds a set of prefixes to the commit message.

E.g. I make a change to `games/spelltower/app.ts` then `[SPTWR]` is automatically added to commit message. 

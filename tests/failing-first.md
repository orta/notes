# Failing Fast

We commonly think of the CI step of a project's lifecycle as being a "I submit a PR and once something is pushed then tests run" - I'd argue that folks are missing a step or two earlier. Having both been an active user [of Husky](https://www.npmjs.com/package/husky) for years, and [built my own version](https://github.com/shibapm/Komondor) for the Swift ecosystem, I've got a good sense of what hooks are available and how to use them.


There are generally two places you can add the automation:
 
 - In the dev's terminal
 - In isolation (aka CI)

The dev's terminal is the under-represented space IMO. There's a lot of smaller places you can hook in via [githooks](https://git-scm.com/docs/githooks) to fail fast. We'll concentrate on this, there's enough writing in the world on CI flows.

## Failing Locally

### Git Pull

Bet you didn't expect this one, [pull-lock](https://www.npmjs.com/package/pull-lock/) gives you a great API for hooking into when someone has pull'd in git. This could automatically pull submodules, run different dependency managers etc etc.

### Git Message

If you care to craft your commit messages in a certain format, this is a probably the first hook. Common use-cases of this in open-source is conformance to a strict format like [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) or [semantic-release](https://www.npmjs.com/package/semantic-release) (which uses [Angular's format](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format)). Personally, I'm not a big fan of this ( I think a commit is the wrong abstraction for this info ) but I can see the value overall.

I've used these hooks before to [_augment_ existing commit messages](../git/commit-scopes-monorepo) with additional metadata.

### Git Commit 

A commit hook is a good spot for _quick_ testing infra, and fast one-offs. If you have a really fast test-suite (e.g. under 1m) then it seems reasonable to hook in at that level. 

[Danger JS](https://danger.systems/js) has [a local mode](https://danger.systems/js/tutorials/fast-feedback.html) which allows for writing some pretty nuanced logic. For example today I added an extra function to a serverless app, and my commit hook told me that I hadn't added a description of it to the README. A common check I do here is to avoid shipping debugging `console.logs` to the app:

```json {6}
{
  // ...
  "husky": {
    "hooks": {
      "prepare-commit-msg": "node scripts/prefixCommitMsg.mjs",
      "pre-commit": "yarn test && yarn danger local --dangerfile dangerfile.local.ts --staging",
      "pre-push": "yarn build && yarn test"
    }
  },
}
```

With a `dangerfile.local.ts` like this:

```ts twoslash
/// <reference types="node" /> 
// ---cut---
import { danger, fail } from "danger"
import { readFileSync } from "fs"

const tsFiles = [...danger.git.modified_files, ...danger.git.created_files].filter(f => f.endsWith(".ts"))
const withConsole = tsFiles.filter(f => readFileSync(f, "utf8").includes("console.log({"))
if (withConsole.length) {
  fail(`There are files with console.logs in them: ${withConsole}`)
}
```

These commit hooks generally represent a fast look over smaller chunks of work, and ideally shouldn't take more than a minute.

#### Failing Faster with Lint Staged

You can bring the speed of your commit hooks down a lot with [lint-staged](https://github.com/okonet/lint-staged). First of all it can be used to only run 

```json
{
 "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.md": "mdspell",
    "*.ts": "prettier",
    "*.spec.ts": "jest",
  }
}
```

Not only does it narrow down the commands to run, lint-staged will pass in the changed files as args - so only the changed files will be used. For example in commiting this file:

```sh
❯ git s
On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   gh-actions/merge-on-green.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        tests/failing-first.md
```

Then lint-staged will execute:

```sh
mdspell gh-actions/merge-on-green.md tests/failing-first.md
```

Which won't check every markdown doc, and won't run `jest` nor `prettier`.

### Git Pre-Push

This is effectively a "PR" level check. I'd recommend running the test suite, code linters and build systems like type checking in here. 
The goal is that a reasonably substantial amount of work has happened and now you want a more thorough validation of your changes.

Deciding whether to do this can can be tricky depending on how long a build takes. Once you get past ~5m I think it's becoming a bit unreasonable to expect everyone to run it most of the time, you've usually lost context by that point.

The TypeScript Website takes ~10m to do a full in-depth run, so I quite often skip this via `--no-verify`. To atone for my build times, [that I made it](https://github.com/microsoft/TypeScript-Website/blob/v2/.huskyrc.js) so that only I have these tests running via husky's JavaScript API:

```ts
const tasks = (arr) => arr.join(" && ")
const isOrta = process.env.USER && process.env.USER.includes("orta")

// Everyone else gets a NO-OP
module.exports = !isOrta
  ? {}
  : {
      hooks: {
        "pre-push": tasks([
          "yarn build",
          "yarn test",
          "afplay .vscode/done.aiff",
          "afplay .vscode/done.aiff",
          "afplay .vscode/done.aiff",
        ]),
      },
    }
```

_The file `.vscode/done.aiff` is the untitled goose game honk_.

<center><img src="https://www.justpushstart.com/wp-content/uploads/2019/12/image-1024x576.jpeg" /></center>

`danger local` was originally built for this level of abstraction, it compares your current branch with `main/master` to determine the set of commits you want to look over. 
You could use that to run a subset of your tools depending on what has changed similar to [lint-staged](https://github.com/okonet/lint-staged).

## Failing Responsibily

I touched on this earlier, but it bears repeating. All automation like this bears a cost, and the cost is that automation has the potential to annoy people who didn't set it up.

Most of the git hooks have a trivial way to skip them via `--no-verify` and all git hooks tell you this when they fail. However, some people just prefer to 'fire and forget' leaving the CI to eventually let them know about fails. [Not everyone is going to like automation](https://www.reddit.com/r/television/comments/8uy8a8/no_matter_what_you_do_not_everyones_gonna_like/).

This is why the time each hook takes is important, it's got to provide enough value for the extra potential noise and speed-bump on someone's flow.

Balancing this is tricky, but just think of it as the quicker the checks the sooner and more often you can do them.

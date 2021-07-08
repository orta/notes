---
published: 2021-02-24T22:12:03.284Z
---
# Yarn vs npm

> ~~"Use yarn, mostly v1, embrace workspaces"~~ "Use pnpm, embrace workspaces"

**Update**: Months later, and after extensive usage, I've concluded that pnpm is now the right mix of CLI experience, workspace support, and alignment with Node. New projects I've been writing in pnpm, and occasionally I migrate from yarn 1 to pnpm. There's a [write-up here](https://orta.io/notes/js/pnpm-succeeds-yarn-1).


When I clone a JS/TS repo and it's not using yarn I usually assume the repo came from someone new to the JS ecosystem. Yarn came out a few years ago and npm is still playing catch-up on features. Originally a Facebook project, but nowadays is ran by non-Facebook folks. Over time, Yarn was re-written and focused on solving different problems than I am seeing.

The npm contributors at the time probably considered creating Yarn a hostile move, but it offered a lot of features that were essential for reliably building apps. People in the JS ecosystem had dependency trees which were easily thousands of deps big but didn't even have a lockfile, bonkers. 

IMO, Yarn is the CLI developer experience I think all other bundler/dependency manager CLI's should strive for.

### Great features

- [[yarn-workspaces]] - is a great want to handle multiple contexts in one repo
- `yarn upgrade-interactive` is very impressive, especially when you have dependency trees the size of nodejs projects
- The way that you can write [`yarn tsc` to run TypeScript](https://github.com/npm/rfcs/pull/279#issuecomment-748102000) from your local dependencies is reason enough to use yarn's CLI even in npm projects  
- [`"resolutions"`](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) - solves huge JS dep tree problems very elegantly

#### Yarn 1 vs npm 7

To be honest, enough changed in npm 7 that I'm not sure how many of my original arguments on yarn vs npm still hold. I've not upgraded locally in part because their [`peerDependencies`](https://github.blog/2021-02-02-npm-7-is-now-generally-available/) change, and in other part because I don't use npm already and I think the CLI experience is worse. [`npm exec`](https://docs.npmjs.com/cli/v7/commands/npm-exec) is a good step forwards though. So now you can do:

```sh
$ yarn tap --bail test/foo.js
# vs
$ npm exec -- tap --bail test/foo.js
```

Still not focused, but better than before  which used a completely different command: `npx`.

#### Yarn 1 vs 2+

The userbase of yarn is split because yarn 2 focused heavily on trying to remove the `node_modules` folder [with zero installs](https://next.yarnpkg.com/features/zero-installs/) for [PNP](https://next.yarnpkg.com/features/pnp) which was probably a mistake. Using PNP means yarn overriding the `require` statement which moves the node_modules into tar files in your repo. The tar files can then be put into your source control.

I think people started to adopt yarn 2 once the team were very explicit that you could avoid Zero Installs & PNP. Both of these ideas do solve real problems, but its trade-offs aren't worth it (personally) and I would have still `.gitignored` it's version of the `node_modules` somewhat negating ~~the whole~~ [some](https://twitter.com/arcanis/status/1364546285865418756) of the point.

I've only moved two projects to yarn 2 (the TypeScript Website and my games) and I don't really gain much. On the net, it was probably a bit more of a negative but I needed some practical experience to make an opinion. After switching, I've got more random files in my repo (yarn config to remove PNP, the JS for the yarn 2 version, the JS for plugins) which I wouldn't have had I stayed on v1, my most used commands (outside of `yarn install`) were moved to [plugins](https://github.com/microsoft/TypeScript-Website/tree/v2/.yarn/plugins/%40yarnpkg) which I guess shows that my usage falls away from the mainstream and the CLI output is an improvement (colour usage and logical grouping :+1:) [~~and some negative "YN0000" et al~~](https://github.com/yarnpkg/berry/pull/2513).

One thing that switching to yarn 2 did which I think was a real positive was a stricter sense of enforcing dependencies across workspaces. For example if one project brought in a dependency, you had to be very explicit that it would be used in that a workspace and it would not be available in other workspaces. Think of it as if you had 3 workspaces, and only one of them included `"typescript"` - then `tsc` would not be available in other workspaces. On top of that, if I were using PNP, that validation would also occur during a `require`. This requirement definitely tightened up the interlinking in the TypeScript monorepo. If it was a complex workspace with a lot of contributors, that's a very big win for safe deploys.

That said, I'd love to use yarn 2 everywhere because the plugin system for v2 is compelling. I'd like to build [yarn-crev](https://github.com/crev-dev)) but it'd require moving any projects to use v2 before I can use the plugin (and the plugin would need wide-adoption to be useful) which makes it not worth putting the time in to build. 

#### Yarn 1 vs PNPM

I've made a few repos with [pnpm](https://pnpm.js.org) to get a sense of whether pnpm could be a replacement for yarn 1 for me. There's some interesting ideas in there. I wasn't a particular fan of having workspace config in it's own yml file vs the `package.json` but that's pretty minor, ~~but it copies npm's CLI experience for running scripts/binaries instead of yarn's which is more of a blocker. So, I've started a discussion about [potentially moving](https://github.com/pnpm/pnpm/discussions/3191).~~ 

pnpm now supports `pnpm tsc` - in my mind it is likely the successor to yarn 1, will test it out the feel on a more complex repo.

#### Future

Yarn 2+ is unlikely to be compelling enough to warrant all the extra files in every repo considering how yarn 1 works perfectly well for the task of getting deps, setting up complex projects and running commands with a great experience. 

It's important to note that the yarn team are OSS folks solving problems they want to solve, and their choice of direction is totally cool with me. I know what it's like to lead large OSS software projects and any decision at this scale are always trade-offs for different portions of their users. My workflow is my workflow, and the grooves of that workflow came from extended usage of yarn 1 everywhere. I think both are great software. It is not that yarn 2 sucks, it's that the default is yarn 1 and yarn 1 works really well. The migration to v2 and keep a similar set of behaviors requires some extra work and files which don't pay for themselves enough to be done consistently.

Because using the command `yarn` defaults to v1 when you install node, then nearly all of the time I'll be using that version. On the long run this is a tad worrying because v1 isn't getting updates and support anymore. Though sometimes the lack of change can be a good thing. My plan is to generally stick with v1 in nearly every repo unless I see a really compelling reason to change.

To imagine what would move yarn 2+ to be my everyday package manager: 

 - Ship `yarn` like a normal module where the version you have is the latest
 - Make the `node_modules` linker be default behavior out of the box
 - Make running `yarn install` only add a lockfile by default

This means you get a 'traditional' / 'works how node works' / 'loose' setup for most projects and give folks the chance to opt-in to more restrictive and powerful options. This pattern works well for TypeScript, people migrate to strict in bigger projects all the time. 

( It'd be _nice_ to have the interactive plugins as default, but the workspaces one I can live with installing when needed in a monorepo. )

Again, I respect the Yarn team's choices to _not_ do this, making these call would be going back on what I think they consider the value of yarn itself when they shipped v2. For me, the value of yarn has been a great UI, fast download/installer, a solid resolver which avoids dupes and with later releases on workspace support. This echoes what I wrote a few months before [Yarn 1.0 came out](https://artsy.github.io/blog/2017/02/05/Front-end-JavaScript-at-Artsy-2017/#Yarn).

Worth thinking about:  An interesting side-effect from v1's the lack of updates, it's possible that npm will now catch up with yarn 1. npm 7 has taken a lot of the good features of yarn 1 and within a few years maybe we'll see experienced JS folks people move back to npm.

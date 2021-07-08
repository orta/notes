---
published: 2021-02-24T22:12:03.284Z
---
# pnpm is my successor to Yarn 1

## The resilient flaws of `npm` as a build manager

One of the mistakes I think we made with [CocoaPods](https://cocoapods.org) over the years was not supporting some sort of way for people to vendor their dev tools within their package manager. Today, CocoaPods only handles your dependencies and then leaves everything else to you. This I think exacerbated the ecosystems reliance on "only Apple tooling" and made it harder for community tools to get popular.

Decisions taken at package manager level are really hard to change because of how reliant the entire ecosystem becomes on almost any choice made. npm has this problem, but because of their scale they are even more resilient to good ideas which require change. Over the last year, this has become far more evident as I've tried to get any changes done through the [npm RFC](https://github.com/npm/rfcs/) process (all of which have failed/stalled) and as I can't even keep a clear map in my mind at how a command works in npm due to subtle changes which only occur in specific cases which has made using npm occasionally for other people's repos tricky.

## The first production-worthy alternative, Yarn 

Yarn's [pitch](https://www.infoq.com/news/2016/10/yarn/) out of [the door in 2016](https://artsy.github.io/blog/2016/11/14/JS-Glossary/#yarn): flattened dependencies, using a lockfile and install-time speed. I adopted Yarn instantly as someone new to the JS ecosystem who grok'd dependency managers, but what I didn't understand then was just how valuable Yarn's focus on trying to fix the project management and build-tool management in the node ecosystem. `npm` had proven itself as a reliable registry and dependency manager, but was weak as a project manager.

I'm throwing around a lot of terms there, so roughly there are three main responsibilities which exist in the domain:

- "Package Manager" -> Takes packages from the internet and downloads them (usually into a global store)
- "Dependency Manager" -> Uses those packages, resolves the requirements into a dependency tree specific to an application
- "Project/Build Management" -> Handling application bootstrapping, tooling, test running, debugging etc

I thought it wasn't CocoaPods' responsibility to handle the being a good project manager, giving the tool more focus on just getting your libraries code in order and passing that responsibility to Apple. This is non-trivial work on its own, then the scope of potential responsibilities for being a good project manager is massive. (That's not even covering the fact that the entire ecosystem shifts ever June when Apple release a year's worth of work to the public overnight. )

Yarn solved a lot of the problems around package and dependency management in their first OSS release, and because Yarn didn't have backwards compatibility to worry about also Yarn fixed most the flaws with npm's build management and then took community ideas like Lerna's workspaces and integrated it natively into the project management aspects of the tool.

Some concrete examples for build tooling which were added at for Yarn 1.0:

 - Separating `install` from `add` in the CLI, simplifying both
 - Scoping global installs in the CLI completely (global tools are a big source of project entropy, so making it harder to use is good DX imo)
 - Making accessing scripts/tools from the CLI consistent  
 - Adding a command for `update`ing the lockfile within the semver range

As npm caught up to yarn v1 in npm 7, npm is still not a very good build management tool. I've used it in a bunch of projects this year before switching them over to pnpm.

What I used to do when I see a `package-lock.json` (indicating the project uses npm) is use `npm install` then use `yarn x` for all other commands (looking at you TypeScript compiler). You get the dependency management tooling set up, then use a different tool for project management. I wasn't around at the start of the Node.js ecosystem, but I wouldn't be too surprised to find that gulp/jake/grunt were all popular because of the weakness of npm's project management tooling. I've never needed to reach for those tools in a project because yarn usually had good enough abstractions to avoid it.

## The second production-worthy alternative, pnpm

I [wrote about why](https://orta.io/notes/js/yarn-vs-npm#Yarn-1-vs-2+) the upgrade path from Yarn 1 (which was EOL'd in Oct 2020) to Yarn 2 isn't generally worth it for me. Which is totally OK, the combination of `npm install` and `yarn x` did work well for most of my small projects, but the inconsistencies felt like constant papercuts when I was building something reasonably complex (the Shiki Twoslash monorepo) and so I deep dived into pnpm.

Rich Harris recommended I take a serious look at [pnpm](https://pnpm.io) when I was doing some Svelte langauge-tools work, and I realize now that just how pnpm had pitched their Package/Dependency management features mostly to the public (fast install / uses symlinks / strict mode) and I had never taken the time to understand what their project management experience looked like. Turns out pnpm was mostly inspired by Yarn and the differences were mainly superficial and easily worked through in an hour or two (the largest differences are in workspace management.)

There's no fancy summary to write, if you were a yarn 1 user wanting a similar experience with modern supported tooling, I'd be looking at pnpm using today.
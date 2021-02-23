# Yarn vs npm

> "Use yarn, mostly v1, embrace workspaces"

When I clone a JS/TS repo and it's not using yarn I usually assume the repo came from someone new to the eco-system. Yarn came out a few years ago and npm is still playing catch-up. Originally a Facebook project, but nowadays is ran by non-Facebook folks. The npm contributors at the time probably considered creating Yarn a hostile move, but it offered a lot of features that were essential for reliably building apps.

Yarn is the CLI developer experience I think all other bundler/dependency manager CLI's should strive for. 

### Great features

- [[yarn-workspaces]]
- `yarn upgrade-interactive` is very impressive, especially when you have dependency trees the size of nodejs projects
- The way that you can write [`yarn tsc` to run TypeScript](https://github.com/npm/rfcs/pull/279#issuecomment-748102000) from your local dependencies is reason enough to use yarn's CLI even in npm projects  

#### Yarn 1 vs 2+

The userbase of yarn is split because yarn 2 focused heavily on trying to remove `node_modules` which was probably a mistake (I think people started to adopt yarn 2 once it was very explicit that you could avoid PNP) - I've only moved two projects to yarn 2 (the TypeScript Website and my games) and I don't really gain much (in fact, my most used commands outside of `install`s are [plugins](https://github.com/microsoft/TypeScript-Website/tree/v2/.yarn/plugins/%40yarnpkg)) which maybes says something about things I think are essential vs the maintainers. 

The plugin system for v2 is compelling, (I'd like to build [yarn-crev](https://github.com/crev-dev)) but it'd require moving all my projects to use v2 to be useful to me personally. Shame.

This split and the way that the cli is set up means nearly all of the time using the command `yarn` is v1, which isn't getting updates and support anymore.

# Yarn Workspaces

An abstraction absolutely worth learning, npm has replicated the feature in [npm 7](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

A yarn workspace is a way to chunk code together in a single repo. The idea evolved from [Lerna](https://lerna.js.org) and I think mostly negates the need to use Lerna from my experience.

 Some practical examples of how I use workspaces:

#### TypeScript Website

- A section of docs is a workspace: handbook docs, tsconfig flags, codegen systems
- Individual npm modules like: @typescript/twoslash, gatsby-remark-twoslash-shiki, etc 
- Sections of the TS website which are imported as oldschool `<script>` tags: playground, sandbox
- The static site generator itself: typescriptlang-org

#### Capture

- Azure functions
- Admin Dashboard 
- KISS Homepage

#### Puzzlebox

- Games
- Web infra


From there, I give all of the packages a script for `"bootstrap"`, `"build"` and `"test"` - they can be NOOPs if it doesn't need it. You can use `yarn workspaces run` to run those command across all projects in the workspace.

My root `package.json` then has scripts like:


```json
{
  "scripts": {
    "bootstrap": "yarn workspaces run bootstrap && BOOTSTRAPPING=true yarn workspaces run build",
    "build-site": "yarn workspace typescriptlang-org build",
    "build": "yarn workspaces run build",
    "start": "yarn workspace typescriptlang-org start",
    "test": "yarn workspaces run test",
  }
}
```

> For yarn 1, yarn 2 has [different syntax](https://github.com/microsoft/TypeScript-Website/blob/3d19e72cdd2016720f9f5a0396b6a295c4c4a9fd/package.json#L38).

#### Deploys

I started writing my own, but now I use [pleb](https://github.com/wixplosives/pleb) - I dislike the name (it's [more or less an insult](https://www.bbc.com/news/magazine-19673697) in british English, but isn't everything?)

Pleb does a great job, it checks if the local package version is higher than the version on npm, and if it is then a version isd. Simple and smart.

[Long form write-up on different techniques I've used are here](https://github.com/microsoft/TypeScript-Website/issues/130#issuecomment-663471663)

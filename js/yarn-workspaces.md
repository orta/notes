## Yarn Workspaces

An abstraction absolutely worth learning, npm has replicated the feature in [npm 7](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

A yarn workspace is a way to chunk code together in a single repo. Some examples of how I use them:

#### TypeScript Website

- A section of docs is a workspace: handbook docs, tsconfig flags, codegen systems
- Individual npm modules like: @typescript/twoslash, gatsby-remark-twoslash-shiki, etc 
- Sections of the TS website which are imported as oldschool `<script>` tags: playground, sandbox
- The static site generator itself

#### Capture

- Azure functions
- Admin Dashboard 
- KISS Homepage

#### Puzzlebox

- Games
- Web infra



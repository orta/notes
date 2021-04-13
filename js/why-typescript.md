# Understanding TypeScript's Popularity

TypeScript is an overwhelmingly popular extension to the JavaScript programming language, which focuses on adding a type layer on top of existing JavaScript syntax which can be erased without runtime changes to the original JavaScript. People percieve TypeScript as "just the compiler", but it's a better mental model to think of TypeScript as two separate entities: The compiler (aka syntax) and language tools (aka editor integration) - by treating these two systems as separate you have two important perspectives to understand decisions get made. 

TypeScript's growth is roughly that the number of downloads [doubles every year](https://www.npmtrends.com/typescript) on npm. Today it's about 20 million downloads a week. Last April it was about 10 million. That growth is consistent, and doesn't seem to be showing any slowing down.

### Major Events Timeline

IMO, these are the big events which enabled TypeScript to keep breaking popularity ceilings: 

- **2014 - TypeScript re-write, TS v1.1** - Post-launch and with an understanding of what TypeScript is, the entire codebase was mostly thrown away and re-written in a functional style (instead of classes with mutation) - this architecture still stands today, and is built with long-running processes and _very rare_ mutations in mind. Someone once mentioned that the _precursor_ to TypeScript (Strada) was written in C++, not certain on that through.

- **2015 - Angular adopts TypeScript, TS v1.5.** - Google were looking at building their own language for Angular, instead opting for using TypeScript. To make this possible, TypeScript broke one of its cardinal rules: Do not implement a TC39 thing  early. Thus `experimentalDecorators` support in TypeScript. This technical debt was _totally_ worth it for everyone involved, even if a 6 years down the line decorators have not been added. 

- **2015 - JSX support in TypeScript, TS v1.6.** - React was also growing to be an extremely popular user interface libraries, and React uses JSX: a JS language extension which effectively supports writing HTML inside JavaScript. TypeScript's support for JSX _allowed_ others to add support for React (support for React lives in @types/react, not inside TypeScript) 

- **2016 - Undefined and Control Flow Analysis, TS v2.0.** - Building on a feature from 1.4, union types - TypeScript added support for declaring that a type could be there or not. This allowed for a type system which could really model most existing JavaScript code. Coming at the same times was code flow analysis which means that if statements and other user code can affect what the type is on different lines/positions.  

- **2016 - JavaScript support, TS v2.3** - JSDoc support [was added](https://github.com/microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript/02c6f865c09cd731a7940a5f7550838fe1576111) which allowed JavaScript projects to start getting some of the benefits of TypeScript _without moving to TypeScript_. Creating the start of an incremental migration path to a TypeScript codebase, but also offering a way to give tooling to JavaScript projects which already exist today.

- **2018 - TypeScript support in Babel, Babel 7** - The start of the end for codebases living in an entirely TypeScript universe. This added [constraints](https://www.typescriptlang.org/tsconfig#isolatedModules) to TypeScript but they are worth it. After this, TypeScript support was a "check box" for JavaScript projects and not a "move from eslint to tslint"  where two separate ecosystems had to exist.

- **2018 - Composite Projects, TS 3.0** - There are many ways to handle massive source code repos, composite projects aer how TypeScript handles it. You can have a single codebase, but with many TypeScript sub-projects inside it which use .d.ts files as the project boundries. This saves time and memory, and most importantly allows you to scale to very big codebases.

- **2019 - Optional Chaining, TS 3.7** - There have been bigger language features, but optional chaining for TypeScript was a perfect mix of working on a high profile _JavaScript_ feature with TC39 which made people _extremely excited_ about TypeScript. It was a prefect example of what TypeScript wanted to be, a good participant in the JS ecosystem and something which people loved. TypeScript should do more of these sorts of projects.

- **2020 - esbuild / swc / sucrase** - New transpilers and JavaScript runtimes support TypeScript syntax from version 1, and anything which builds on these tools gets TypeScript support out of the box. This continues to legitimize the additional TypeScript syntax as a built-in extension to JavaScript which is turned on in a .ts file.  

- **2020 - Docs re-write** - This is _my_ work so take it with some salt, but documentation around TypeScript had been pretty weak over the years. I worked with many long-term compiler authors to re-fresh all user-facing docs, and made a playground which helps users understand TypeScript. It's the first point of call for questions on the language and great docs frees up the compiler team to focus on the compiler. 

### Guestimates at the future?

I think there's likely going to be some sort of "types as comments" in JavaScript the langauge. It would carve out a set of syntax which type-systems like TypeScript can use, but does not define what happens in there in JS runtimes.

```ts
const a: string = "1234"
```

The JS engine would know that a colon after an identifier `: string` is the start of a type comment which ends at an `=` in this case. How that could actually work is complex, but something like that would constrain TypeScript in the same way Babel support did - probably more so. However, the advantages of having TypeScript 'natively' running in JavaScript would reduce the tooling barrier to using TypeScript effectively nothing. That'd be worth it.


### What are TypeScript's Competitors?

The goal is to provide tooling for JavaScript projects that allow people to write very large codebases and feel confident in changes. JavaScript on it's own does not have enough syntax to _reliably_ know what every identifier could be without _running_ that JavaScript and introspecting the types at runtime. To fix this, TypeScript adds additional syntax.

So if the goal is tooling, then there are a few competitors in that space:

- JetBrains WebStorm: An IDE with advanced JavaScript tooling. They have their own engine for refactoring tools, code flow analysis and linting JavaScript projects. It's great, JetBrains does solid work on all their IDEs. I used to use AppCode a lot. When you have a TypeScript project, they mix the language tools for TypeScript with their own tooling which is win. 

- ESlint and TSLint: Both are made to highlight possible errors in your code, in the same way that TypeScript does. They just don't add additional syntax in order to give hints to the checking process. Neither aim to run as a tool for IDE integration, and often both TS and TS/ESLint can say "that's the domain of the other" on features which don't make sense to that project.  In modern code, TS/ESLint allow TypeScript to have less checks which aren't globally appropriate to all codebases. While there's some overlap, it's better to think about them as complementary projects.  

- Coffescript: Hey, TypeScript is came out [in 2012](https://www.zdnet.com/article/who-built-microsoft-typescript-and-why/)! CoffeeScript vs TypeScript differ in that CoffeeScript wanted to _improve_ the JavaScript language, e.g. adding features to JavaScript. This meant learning the difference between CoffeeScript and the output JavaScript. Over time, the best ideas from CoffeeScript made it into JavaScript and people felt burned by an 'almost JavaScript'. This is generally true of any compiler-to-js languages like Elm or ReScript. They are _great_ languages, but their improvements to JavaScript are also what makes it harder for them to have a _perfect_ interop story. TypeScript allows for JavaScript's flaws. 

- Flow: Facebook's JavaScript type-checker and IDE tooling language. Flow, like TypeScript, adds additional syntax support to JavaScript to let you have a richer type-system which is erased by a transpile step. When I started doing JavaScript, Flow was what I started with first because it had a better pitch of being 'closer' to standard JavaScript. Flow is a great type system, and the type-systen has different goals to TypeScript. Any invisible type-layer system has to constantly make decisions about 'being correct' or 'feeling correct' - Flow aims for 'being correct', while TypeScript aims for 'feeling correct'. Pick two: `Correct` / `Developer Experience` / `Perfect JavaScript Interop`.

    So, why did most Flow codebases end up converting to TypeScript? IMO, a large amount of the reasoning is that the teams have different focuses. Flow is built for maintaining the Facebook codebase vs TypeScript which is built as a stand-alone language. Examples of how this difference is expressed comes from something like DefinitelyTyped vs flow-typed. The TypeScript team have a compiler engineer on rotation for DefinitelyTyped support building out tools and helping manage the community. For flow-typed it's almost exclusively ran by the community. DT is bigger _now_ because of that constant work. 

    TypeScript had the ability and freedom to focus on the ecosystem as an entity and not soley on one single codebase. That gave the team the ability to work with many others and  constantly release things the community wanted. It reminds me of a blog post I wrote on Relay, see the [community section](https://artsy.github.io/blog/2019/04/10/omakase-relay/#Community) and replace "Relay" with "Flow", and "Apollo" with "TypeScript".

### How does TypeScript think of its userbase?

There are a few userbases for TypeScript:

- JavaScript users (language tools)
- JS + JSDoc users (language tools)
- TypeScript users (compiler, language tools)
- TypeScript Strict (compiler, language tools)

With compiler being optional if a codebase uses babel/swc/sucrase/esbuild etc. Each of these sets of folks _tends_ to get something each release, but [definitely every 2 releases](https://github.com/microsoft/TypeScript/issues/42673)


### How does TypeScript track the eco-system

The team listens to feedback from a few ways:

- The GitHub issues is a constant torrent of comments
- Internal Microsoft teams request features, or request we help debug their slow codebases
- Connecting to the community via Gitter or the TypeScript Community Discord
- Running user-tests on ideas / designs via Microsoft's internal tooling
- Having a _very tight_ relationship with VS Code, lots language tools feedback comes through them
- We read every @typescript tweet
- We keep track migration blog posts, to TypeScript and from TypeScript 
- We track industry surveys and programming langauge overviews

# How I test JS

I used to write a lot more [[js/jest]] tests when I came to JavaScript, but over time I write less tests and rely on the TypeScript compiler more. I only interact with TypeScript or JSDoc-checked JS and so I know that I don't need to try and cover states which the compiler won't allow. 

### When to write a test

Historically, I tend to mostly write codebases on my own, with occasional other contributors. So, my testing needs are not the same as those in persistent codebases with many team-members.

I use tests as a communication pattern to future me, and rando contributors. 

- If it was complex to write, it needs a test
- If it is complex to understand, it needs a test
- If I got it wrong the first time, it needs a test
- If it lives in a complex system, it probably needs a test
- If it is easier to TDD it then build it in context, then TDD it

The last one comes up quite a lot, it's often only a tiny bit of more upfront effort to set up the test suite instead of clicking a few buttons again and again to verify the results.  

### What level of testing is needed?

IMO there are a few different types of abstractions for tests:
 
- Unit (aka a function)
- Integration (aka a series of functions)
- Commit (aka a git commit)
- PR (aka a series of git commits)

A well tested repo would have some thing which kinda hits all of these at different levels. For example on a current games project:

- (Unit) Lots of jest tests for specific functions (distance from x, mouse pointer to tile-y kinda stuff)
- (Integration) Jest tests which send redux actions and validate the output state
- (Commit) `danger local` which checks for console.logs in changed files, and that there is no `.only` in test files
- (PR) CHANGELOG check, code spellchecker, CI etc


# Job Working Dirs

When working in complex repos, you can use `working-dir` on a job to run the command in a specific folder. In this repo all the gatsby stuff lives in `_layouts`, so we want most of the actions jobs to run inside `_layouts`.

```yaml
name: Deploy Site

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-20.04
    steps:
      - uses: actions/checkout@v2

      - name: Setup | Node
        uses: actions/setup-node@v2
        with:
          node-version: '14'

      - name: Install dependencies
        run: yarn
        working-directory: _layouts

      - name: Build Site
        run: yarn build
        working-directory: _layouts

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          publish_dir: ./_layouts/public
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

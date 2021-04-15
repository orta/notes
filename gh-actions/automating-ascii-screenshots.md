## Automating ASCII Screenshots

I don't want to be recording stuff like the text output of a command on my own computer, CI should be the one doing derived work. So, I put together a bunch tools on GitHub Actions to record a CLI experience and generate a GIF of the terminal usage. 

This uses the techniques of https://asciinema.org - but doesn't use their web service, everything happens on CI.

```yml
name: ci

on:
  push:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:

    # Checkout and leave the chance for us to override the creds
    - uses: actions/checkout@v2
      with:
        persist-credentials: false 
        fetch-depth: 0 

    # My example is a Deno app
    - uses: denolib/setup-deno@v2
      with:
        deno-version: v1.x

    # Need python set up because we use pip to grab asciicinema
    # which records a terminal session to a .json file
    - uses: actions/setup-python@v2
      with:
        python-version: 3.9

    # My fork has hardcoded column and row widths 
    # ( https://github.com/orta/asciinema/blob/develop/asciinema/term.py )
    - name: Setup
      run: |
        sudo pip install git+https://github.com/orta/asciinema.git

    # Run the command in the context of asciinema
    - name: Run
      run: |
        asciinema rec recording.cast -c 'deno run index.ts'

    # Use a third party action to write the GIF, it's a bunch
    # of docker faff, so worth the cost of the 3rd party dep
    - name: Asciicast file to GIF
      uses: dgzlopes/asciicast-to-gif-action@v1.0
      with:
        input: recording.cast
        output: screencast.gif
        theme: tango
        speed: 0.5
        scale: 0.8

    # Now the GIF has been written, commit the GIF and push it to the repo
    - name: Run
      run: |
        git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
        git config --local user.name "github-actions[bot]"
        git add screencast.gif
        git commit -m "[skip ci] Update the screencast" -a

    - name: Push changes
      uses: ad-m/github-push-action@master
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${{ github.ref }}
```

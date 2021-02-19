# Prod vs Staging GitHub Actions

In the TypeScript website, deploys on staging vs prod are handled in different .yml files. 

This is OK, but a bit meh. When working on setting up staging vs prod for [cloudcapture.it](http://cloudcapture.it), 
I opted for trying to get both environments represented in the same yml file. After some faffing, I came up with a pretty elegant answer.


```yml
name: Upload infra

on:
  push:
    branches:
      - main
      - prod

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: actions/setup-node@v1
        with:
          node-version: "12.x"
      - run: "yarn install"
      - run: "node scripts/repoLint.js"

      # To keep one yml, we set the environments for staging vs prod ahead of time
      - name: Set prod env
        if: ${{ github.ref == 'refs/heads/prod' }}
        run: |
          echo "AZURE_STATIC_WEB_APPS_API_TOKEN=$(echo $PROD_AZURE_STATIC_WEB_APPS_API_TOKEN)" >> $GITHUB_ENV
          echo "FUNC_APP=kisservices-production" >> $GITHUB_ENV
          echo "FUNCS_URL=https://api.kisservices.dev" >> $GITHUB_ENV
          echo "FUNCTIONS_DEPLOY_PROFILE=$(echo $PROD_FUNCTIONS_DEPLOY_PROFILE)" >> $GITHUB_ENV
          echo "DEPLOY_TYPE=Prod" >> $GITHUB_ENV
          echo "STRIPE_PUB_KEY=pk_live_51HZNb0Kjk5Zy6fGqOq3GH9N5V9qokDWgofYc1xGJN6sQjBwAYPJciCUfpOC8EZoXqGvmQmoOSXmao39tgR28ov4a00JfWsUkxt" >> $GITHUB_ENV
        env:
          PROD_AZURE_STATIC_WEB_APPS_API_TOKEN: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROUD_GLACIER_0EE68890F }}
          PROD_FUNCTIONS_DEPLOY_PROFILE: ${{ secrets.KISS_DEPLOY_PROFILE }}

      - name: Set staging env
        if: ${{ github.ref == 'refs/heads/main' }}
        run: |
          echo "AZURE_STATIC_WEB_APPS_API_TOKEN=$(echo $STAGING_AZURE_STATIC_WEB_APPS_API_TOKEN)" >> $GITHUB_ENV
          echo "FUNC_APP=kisservices-staging" >> $GITHUB_ENV
          echo "FUNCS_URL=https://api-staging.kisservices.dev" >> $GITHUB_ENV
          echo "FUNCTIONS_DEPLOY_PROFILE=$(echo $STAGING_FUNCTIONS_DEPLOY_PROFILE)" >> $GITHUB_ENV
          echo "DEPLOY_TYPE=Staging" >> $GITHUB_ENV
          echo "STRIPE_PUB_KEY=pk_test_51HZNb0Kjk5Zy6fGqt3fg4DVedSdQiplNN4XzgAIzf7p26DVURQoplgyzrXzZw89l9It5ZZ2AuE3He8hh5qHymC7k00BXO6AIkT" >> $GITHUB_ENV
        env:
          STAGING_AZURE_STATIC_WEB_APPS_API_TOKEN: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_ORANGE_FIELD_0B6DD910F }}
          STAGING_FUNCTIONS_DEPLOY_PROFILE: ${{ secrets.KISS_STAGING_DEPLOY_PROFILE }}

      - run: "yarn build"
      - run: "yarn test"
      - run: "yarn check-site"

      - name: Deploy Zoom Dashboard
        uses: Azure/static-web-apps-deploy@v0.0.1-preview
        with:
          action: "upload"
          app_artifact_location: "public"
          app_location: "dashboard"
          azure_static_web_apps_api_token: ${{ env.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
        env:
          KISS_SERVICES_FUNCS_URL: ${{ env.FUNCS_URL }}
          STRIPE_PUBLISHABLE_KEY: ${{ env.STRIPE_PUB_KEY }}

      ## Upload the Subscriptions app
      - uses: Azure/functions-action@v1
        with:
          app-name: ${{ env.FUNC_APP }}
          publish-profile: ${{ env.FUNCTIONS_DEPLOY_PROFILE }}
          package: functions

```


### The moving parts


1. Using `if: ${{ github.ref == 'refs/heads/prod' }}` to scope the setting up of environment jobs
2. For those actions, move the secrets into the ENV, then setting them _back_ to the global ENV. Let's follow the setup for `FUNCTIONS_DEPLOY_PROFILE` which is basically the access token for uploading to azure. For example:

  - In the staging job:
    - Set the env var `STAGING_FUNCTIONS_DEPLOY_PROFILE` to the secret `${{ secrets.KISS_STAGING_DEPLOY_PROFILE }}`
    - Export the staging env var to the generally named `FUNCTIONS_DEPLOY_PROFILE` -> `echo "FUNCTIONS_DEPLOY_PROFILE=$(echo $STAGING_FUNCTIONS_DEPLOY_PROFILE)" >> $GITHUB_ENV`

  - In the prod job:
    - Set the env var `PROD_FUNCTIONS_DEPLOY_PROFILE` to the secret `${{ secrets.KISS_STAGING_DEPLOYKISS_DEPLOY_PROFILE_PROFILE }}`
    - Export the prod env var to the generally named `FUNCTIONS_DEPLOY_PROFILE` -> `echo "FUNCTIONS_DEPLOY_PROFILE=$(echo $PROD_FUNCTIONS_DEPLOY_PROFILE)" >> $GITHUB_ENV`

After _either_ of the prod or staging jobs have been finished, then you know that there is a `FUNCTIONS_DEPLOY_PROFILE` which either contains prod or staging data.

Then you can rely on that ENV var, and you're good.

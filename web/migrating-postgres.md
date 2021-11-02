# Migrating a db from prod/staging to localhost

I use postgres pretty much everywhere and this setup has followed me across many projects and languages, it's a quick script for cloning the db to a local copy. Mostly just a wrapper around pg_dump and psql.

```js twoslash
// @strict: false
/// <reference types="node" /> 
// ---cut---
// @ts-check
/* You need an .env with:

# DATABASE_URL="postgres://abc:def@prod.com/removeDBName"
STAGING_DATABASE_URL="postgres://abc:def@prod.com/removeDBName"
LOCAL_DATABASE_URL='postgres://postgres:postgres@localhost:5432/localDBName'

*/
const dotenv = require("dotenv")
dotenv.config()

const { execSync } = require("child_process")
const { existsSync } = require("fs")

const tmpFile = "/tmp/staging.sql"

const prefixes = ["/Applications/Postgres.app/Contents/Versions/latest/bin", "/usr/bin"]
const prefix = prefixes.find((f) => existsSync(f + "/psql"))
if (!prefix) throw new Error("Could not find psql, check the list of prefixes and add it, find it via: 'which psql' ")

const dbComponents = process.env.LOCAL_DATABASE_URL.split("/")
const localName = dbComponents.pop()
const localURL = dbComponents.join("/")

console.log(`Dumping prod URL to ${tmpFile}`)
execSync(`${prefix}/pg_dump ${process.env.STAGING_DATABASE_URL} -f ${tmpFile}`)

try {
  execSync(`${prefix}/psql postgres://localhost -c 'DROP DATABASE "${localName}"' `)
} catch (_) {
  console.log("First time run, not deleting old db")
}

console.log(`Creating DB ${localName}`)
execSync(`${prefix}/psql ${localURL} -c 'CREATE DATABASE "${localName}"'`)

console.log(`Piping in new DB`)
execSync(`${prefix}/psql ${localURL}/${localName} -f ${tmpFile}`)

console.log(`Done`)

```
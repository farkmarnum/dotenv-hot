# dotenv-hot 🔥

Dotenv that works with hot reloading.

## Installation

```bash
npx dotenv-hot install
```
*After running this, commit the staged changes.*

## Usage

```bash
npx dotenv-hot watch
```

Or, install with `yarn add -D dotenv-hot` and add to your `package.json`:
```json
{
  "scripts": {
    "watch-env": "dotenv-hot watch"
  }
}
```

You can also run `npx dotenv-hot --help` for a full usage message.

## To remove

To remove the added files and the git fiter, run:
```bash
npx dotenv-hot uninstall
```

## How it works

### When installed
- It creates several files:
   - `.envFromFile.[ts|js]` — when `watch` is run, the values from `.env` are loaded into this file as JS variable declarations. This file is fully maintained by `dotenv-hot` and should not be modified. By default this is added in `<gitRepoRoot>/src`, but can be customized with the `--env-module-dir` flag.

   - `env.[ts|js]` — this file handles importing the vars from `.envFromFile.[ts|js]`, falling back on the values in `process.env`, and exporting. This is where you'll import env vars from, and you'll need to add new lines in this file when you have new env vars that you want to use in this way. By default this is also added in `<gitRepoRoot>/src`, but is also customizable with the `--env-module-dir` flag.

   - `git-filter-dotenv-hot-env-module.sh` — this is a script for use by `git` as a `filter`. This file also does not need to be modified. By default this is added in `<gitRepoRoot>/scripts`, but can be customized with the `--scripts-dir` flag.

- It tells `git` to use the filter in `scripts` for the `.envFromFile.[ts|js]` file. This prevents the local changes that are made to this file from being seen by git.

### When run with `watch`

- It monitors the contents of `.env`, and if they change it updates `.envFromFile.[ts|js]`

### When in prod

By default, any `.env` files will be ignored by this package in `prod`, since the `dotenv-hot watch` process will not be running. However, if you need to load values from a `.env` file in prod (no hot realoding here though), you can add `dotenv` and uncomment the relevant lines in `env.[ts|js]`.

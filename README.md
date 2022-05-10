# dotenv-hot 🔥
Dotenv that works with hot reloading.

## Setup

Install:
```bash
yarn add -D dotenv-hot
# OR
npm install -D dotenv-hot
```

Add to your `package.json`:
```json
{
  "scripts": {
    "setup-env": "dotenv-hot setup -y -d src",
    "watch-env": "dotenv-hot watch"
  }
}
```
## Usage

Each person who has a local copy of the repository will need to run `yarn setup-env` once, and then can run `yarn watch-env` concurrently while developing.

You can also run `npx dotenv-hot --help` for a full usage message.

## Tips

NOTE: if you end up in a situation where your `git` working tree looks like it should be clean, but there appears to be a modification made to the `envFromFile` file, running `git add .` should fix.

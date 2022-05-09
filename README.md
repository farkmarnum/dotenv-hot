# dotenv-hot

## Setup

1. Setup with `npx dotenv-hot setup`
2. Run wth `npx dotenv-hot watch`

To make things easier, you can add these as `scripts` and include your config options:

```json
// package.json
{
  "scripts": {
    "setup-env": "npx ../dotenv-hot setup -y -d src",
    "watch-env": "npx ../dotenv-hot watch",
  }
}
```

## Usage

Run `npx dotenv-hot --help` for full usage message.

## Tips

NOTE: if you get this message
```
Git working tree must be clean before 'setup' can be run. Please commit or stash your changes. The current working tree:
```
but your working tree looks like it should be clean, `git` may be having an issue with the fiter change.

Running `git add .` should fix.

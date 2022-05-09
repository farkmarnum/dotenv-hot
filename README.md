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

NOTE: if you end up in a situation where your `git` working tree looks like it should be clean, but there appears to be a modification made to the `envFromFile` file, running `git add .` should fix.

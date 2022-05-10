#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './ui';
import { PACKAGE_NAME } from './helpers/constants';

const cli = meow(
  `
Usage
  $ ${PACKAGE_NAME} <command> [<flags>]

Commands
  install                 Initial setup: create env.[js|ts], add gitattributes filter, etc.
  watch                   Watch .env for changes and update env.[js|ts] accordingly.
  uninstall               Remove the added files & the git filter.

Flags
  -e, --env-module-dir    Target directory for env.[js|ts] file, from the root of the git repository. Defaults to 'src/'.
  -s, --scripts-dir       Target directory for git script, from the root of the git repository. Defaults to 'scripts/'.
  -y, --yes               Answer "yes" to all confirmation questions.
`,
  {
    flags: {
      envModuleDir: {
        type: 'string',
        alias: 'e',
      },
      scriptsDir: {
        type: 'string',
        alias: 's',
      },
      yes: {
        type: 'boolean',
        alias: 'y',
      },
    },
  },
);

render(
  <App
    command={cli.input[0]}
    envModuleDir={cli.flags.envModuleDir}
    scriptsDir={cli.flags.scriptsDir}
    shouldSkipConfirmations={cli.flags.yes}
  />,
);

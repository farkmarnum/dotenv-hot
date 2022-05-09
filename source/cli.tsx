#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './ui';
import { PACKAGE_NAME } from './helpers/constants';
// import { runInitialGuards } from './helpers/guards';

const cli = meow(
  `
  Usage
    $ ${PACKAGE_NAME} <command>

  Commands
    setup  Initial setup

  Examples
    $ ${PACKAGE_NAME} setup
`,
  {
    flags: {
      name: {
        type: 'string',
      },
    },
  },
);

render(<App />);
render(<App name={cli.flags.name} />);

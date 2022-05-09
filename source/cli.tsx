#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './ui';
import { PACKAGE_NAME } from './helpers/constants';

const cli = meow(`
Usage
  $ ${PACKAGE_NAME} [<command>]

Commands
  setup - Initial setup: create env.[js|ts], add gitattributes filter, etc.
  watch - Watch .env for changes and update env.[js|ts] accordingly.
`);

render(<App args={cli.input} />);
